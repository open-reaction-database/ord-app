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
from typing import Annotated

from fastapi import APIRouter, HTTPException, Response, UploadFile, status
from fastapi.params import Depends
from fastapi_pagination import Page
from ord_schema.templating import generate_dataset, read_spreadsheet
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.auth import authenticate, dataset_authorization, group_authorization
from ord_app.service_api.domain.datasets import DatasetUseCases, get_dataset_use_case
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
    "/groups/{group_id}/datasets",
    response_model=DatasetSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(group_authorization(("admin", "editor")))],
)
async def create_dataset(
    group_id: int,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
    payload: DatasetCreateSchema,
):
    return await use_case.create(group_id, payload)


@router.get(
    "/groups/{group_id}/datasets",
    response_model=Page[DatasetWithReactionCountSchema],
    dependencies=[Depends(group_authorization(("admin", "editor", "viewer")))],
)
async def get_group_datasets(
    group_id: int,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
):
    return await use_case.paginate_group_datasets(group_id)


@router.post(
    "/groups/{group_id}/datasets/upload",
    response_model=DatasetSchema,
    dependencies=[Depends(group_authorization(("admin", "editor")))],
)
async def upload_dataset(
    group_id: int,
    file: UploadFile,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
):
    return await use_case.upload(group_id, file)


@router.get("/datasets", response_model=Page[DatasetWithReactionCountSchema])
async def get_user_datasets(
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
):
    return await use_case.paginate_user_datasets()


@router.patch(
    "/datasets/{dataset_id}",
    response_model=DatasetSchema,
    dependencies=[Depends(dataset_authorization(("admin", "editor", "viewer")))],
)
async def update_dataset(
    dataset_id: int,
    payload: DatasetCreateSchema,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
):
    return await use_case.update(dataset_id, payload)


@router.delete("/datasets/{dataset_id}", dependencies=[Depends(dataset_authorization(("admin",)))])
async def delete_dataset(
    dataset_id: int,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
):
    # TODO: soft deletion needs to be implemented
    await use_case.delete(dataset_id)
    return "Object successfully deleted (or already absent)"


@router.get(
    "/datasets/{dataset_id}",
    response_model=DatasetSchema,
    dependencies=[Depends(dataset_authorization(("admin", "editor", "viewer")))],
)
async def get_dataset(
    dataset_id: int,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
):
    if dataset := await use_case.get(dataset_id):
        return dataset
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")


@router.get(
    "/datasets/{dataset_id}/download",
    dependencies=[Depends(dataset_authorization(("admin", "editor", "viewer")))],
)
async def download_dataset(
    dataset_id: int,
    file_format: DownloadFileFormats,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
):
    # NOTE(skearnes): See https://protobuf.dev/reference/protobuf/textformat-spec/#text-format-files for comments on
    # preferred file extensions.
    try:
        dataset, data = await use_case.download(dataset_id, file_format)
    except EntityDoesNotExist as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e

    return Response(
        gzip.compress(data),
        headers={"Content-Disposition": f'attachment; filename="{dataset.name}.{file_format}.gz"'},
        media_type="application/gzip",
    )


@router.post(
    "/datasets/enumerate_dataset/{user_id}",
    dependencies=[Depends(group_authorization(("admin", "editor", "viewer")))],
)
async def enumerate_dataset(
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
        # ds = DatasetModel(owner=user, group_id=group_id, name=dataset.name, binpb=dataset.SerializeToString())
        ds = DatasetModel(owner=user, name=dataset.name)
        db_session.add(ds)
        await db_session.commit()
        return basename
    except Exception as error:  # pylint: disable=broad-except
        return Response(str(error), status_code=400)
