# Copyright 2024 Open Reaction Database Project Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
import gzip
import os
from io import BytesIO

from fastapi import APIRouter, HTTPException, Response, UploadFile, status
from fastapi.params import Depends
from fastapi_pagination import Page
from ord_schema.templating import generate_dataset, read_spreadsheet
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.auth import authenticate, authorize
from ord_app.service_api.domain.datasets import (
    create_dataset,
    delete_dataset,
    download_dataset,
    get_user_dataset,
    paginate_group_datasets,
    paginate_user_datasets,
    upload_user_dataset,
)
from ord_app.service_api.domain.exceptions import EntityDoesNotExist
from ord_app.service_api.models import DatasetModel, UserModel
from ord_app.service_api.schemas.datasets import (
    DatasetCreateSchema,
    DatasetSchema,
    DatasetWithReactionCountSchema,
    DownloadFileFormats,
)
from ord_app.service_api.services.postgresql import get_db_session

router = APIRouter(tags=["datasets"])


@router.post(
    "/groups/{group_id}/datasets/",
    response_model=DatasetSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(authorize(("admin", "editor", "viewer")))],
)
async def _create_dataset(
    group_id: int,
    payload: DatasetCreateSchema,
    user: UserModel = Depends(authenticate),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await create_dataset(db_session, group_id, user, payload)


@router.get(
    "/groups/datasets/",
    response_model=Page[DatasetWithReactionCountSchema],
)
async def user_datasets(
    user: UserModel = Depends(authenticate),
    db_session: AsyncSession = Depends(get_db_session),
):
    # Authorization checked inside the query in the database
    return await paginate_user_datasets(db_session, user)


@router.get(
    "/groups/{group_id}/datasets/",
    response_model=Page[DatasetWithReactionCountSchema],
    dependencies=[Depends(authorize(("admin", "editor", "viewer")))],
)
async def group_datasets(
    group_id: int,
    user: UserModel = Depends(authenticate),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await paginate_group_datasets(db_session, group_id)


@router.delete(
    "/groups/{group_id}/datasets/{dataset_id}", dependencies=[Depends(authorize(("admin", "editor", "viewer")))]
)
async def _delete_dataset(
    group_id: int,
    dataset_id: int,
    user: UserModel = Depends(authenticate),
    db_session: AsyncSession = Depends(get_db_session),
):
    await delete_dataset(db_session, group_id, dataset_id, user)
    return Response("Object successfully deleted (or already absent)")


@router.post("/groups/{group_id}/datasets/upload", dependencies=[Depends(authorize(("admin", "editor", "viewer")))])
async def upload_dataset(
    group_id: int,
    file: UploadFile,
    user: UserModel = Depends(authenticate),
    db_session: AsyncSession = Depends(get_db_session),
):
    await upload_user_dataset(db_session, group_id, user, file)


@router.get(
    "/groups/{group_id}/datasets/{dataset_id}",
    response_model=DatasetSchema,
    dependencies=[Depends(authorize(("admin", "editor", "viewer")))],
)
async def fetch_dataset(
    group_id: int,
    dataset_id: int,
    user: UserModel = Depends(authenticate),
    db_session: AsyncSession = Depends(get_db_session),
):
    if dataset := await get_user_dataset(db_session, group_id, dataset_id, user):
        return dataset
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")


@router.get(
    "/groups/{group_id}/datasets/{dataset_id}/download",
    dependencies=[Depends(authorize(("admin", "editor", "viewer")))],
)
async def _download_dataset(
    group_id: int,
    dataset_id: int,
    file_format: DownloadFileFormats,
    user: UserModel = Depends(authenticate),
    db_session: AsyncSession = Depends(get_db_session),
):
    # NOTE(skearnes): See https://protobuf.dev/reference/protobuf/textformat-spec/#text-format-files for comments on
    # preferred file extensions.
    try:
        dataset, data = await download_dataset(db_session, group_id, dataset_id, user, file_format)
    except EntityDoesNotExist as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    return Response(
        gzip.compress(data),
        headers={"Content-Disposition": f'attachment; filename="{dataset.name}.{file_format}.gz"'},
        media_type="application/gzip",
    )


@router.post(
    "/groups/{group_id}/datasets/enumerate_dataset/{user_id}",
    dependencies=[Depends(authorize(("admin", "editor", "viewer")))],
)
async def enumerate_dataset(
    group_id: int,
    template: UploadFile,
    spreadsheet: UploadFile,
    user: UserModel = Depends(authenticate),
    db_session: AsyncSession = Depends(get_db_session),
):
    """TODO: (It is unclear what this endpoint does) Creates a new dataset based on a template reaction and a spreadsheet."""
    try:
        basename, suffix = os.path.splitext(os.path.basename(spreadsheet.filename))
        dataframe = read_spreadsheet(BytesIO(await spreadsheet.read()), suffix=suffix)
        dataset = generate_dataset(
            name=basename,
            description="Enumerated by the ORD editor.",
            template_string=(await template.read()).decode(),
            df=dataframe,
            validate=False,
        )
        ds = DatasetModel(owner=user, group_id=group_id, name=dataset.name, binpb=dataset.SerializeToString())
        db_session.add(ds)
        await db_session.commit()
        return basename
    except Exception as error:  # pylint: disable=broad-except
        return Response(str(error), status_code=400)
