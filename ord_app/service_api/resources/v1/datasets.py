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

"""Dataset API endpoints."""
import gzip
import os
from io import BytesIO

from fastapi import APIRouter, Response, UploadFile, status
from fastapi.params import Depends
from ord_schema.templating import generate_dataset, read_spreadsheet
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.datasets import get_user_datasets, create_dataset_uc, delete_user_dataset, \
    upload_user_dataset, get_user_dataset, download_user_dataset
from ord_app.service_api.models import DatasetModel
from ord_app.service_api.schemas.datasets import DatasetSchema, DatasetCreateSchema, DownloadFileFormats
from ord_app.service_api.services.postgresql import get_db_session

router = APIRouter(tags=["datasets"], prefix="/datasets")


@router.post(
    "/",
    response_model=DatasetSchema,
    status_code=status.HTTP_201_CREATED
)
async def create_dataset(
    user_id: int,
    payload: DatasetCreateSchema,
    db_session: AsyncSession = Depends(get_db_session),
):
    return await create_dataset_uc(db_session, payload, user_id)


@router.get("/", response_model=list[DatasetSchema])
async def list_datasets(
    user_id: int,
    db_session: AsyncSession = Depends(get_db_session),
):
    return await get_user_datasets(db_session, user_id)


@router.delete("/{dataset_id}")
async def delete_dataset(
    user_id: int,
    dataset_id: int,
    db_session: AsyncSession = Depends(get_db_session),
):
    await delete_user_dataset(db_session, user_id, dataset_id)


@router.post("/upload")
async def upload_dataset(
    user_id: int,
    file: UploadFile,
    db_session: AsyncSession = Depends(get_db_session),
):
    await upload_user_dataset(db_session, user_id, file)


@router.get("/{dataset_id}", response_model=DatasetSchema)
async def fetch_dataset(
    user_id: int,
    dataset_id: int,
    db_session: AsyncSession = Depends(get_db_session),
):
    return await get_user_dataset(db_session, user_id, dataset_id)


@router.get("/{dataset_id}/download")
async def download_dataset(
    user_id: int,
    dataset_id: int,
    file_format: DownloadFileFormats,
    db_session: AsyncSession = Depends(get_db_session),
):
    # NOTE(skearnes): See https://protobuf.dev/reference/protobuf/textformat-spec/#text-format-files for comments on
    # preferred file extensions.
    dataset, data = await download_user_dataset(db_session, user_id, dataset_id, file_format)
    return Response(
        gzip.compress(data),
        headers={"Content-Disposition": f'attachment; filename="{dataset.name}.{file_format}.gz"'},
        media_type="application/gzip",
    )


@router.post("/enumerate_dataset/{user_id}")
async def enumerate_dataset(
    user_id: str,
    template: UploadFile,
    spreadsheet: UploadFile,
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
        ds = DatasetModel(
            user_id=user_id,
            dataset_name=dataset.name,
            binpb=dataset.SerializeToString()
        )
        db_session.add(ds)
        await db_session.commit()
        # with get_cursor() as cursor:
        #     add_dataset(user_id, dataset, cursor)
        return basename
    except Exception as error:  # pylint: disable=broad-except
        return Response(str(error), status_code=400)
