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
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Response, UploadFile, status
from fastapi.params import Depends
from fastapi_pagination import Page
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.auth import dataset_authorization, group_authorization
from ord_app.service_api.domain.datasets import DatasetUseCases, get_dataset_use_case
from ord_app.service_api.domain.reactions import validate_dataset_reactions
from ord_app.service_api.schemas.datasets import (
    DatasetCreateSchema,
    DatasetEnumerateCreateSchema,
    DatasetEnumerateExtendSchema,
    DatasetResponseSchema,
    DatasetSharableResponseSchema,
    DatasetShareCreateSchema,
    DatasetShareSchema,
    DatasetWithReactionCountResponseSchema,
    DownloadFileFormats,
)
from ord_app.service_api.schemas.groups import GroupShareSchema
from ord_app.service_api.services.exceptions import EntityNotFoundError
from ord_app.service_api.services.pb_utils import (
    validate_uploaded_pb_file,
)
from ord_app.service_api.services.postgresql import get_db_session

router = APIRouter(tags=["datasets"])


@router.post(
    "/groups/{group_id}/datasets",
    response_model=DatasetResponseSchema,
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
    response_model=Page[DatasetWithReactionCountResponseSchema],
    dependencies=[Depends(group_authorization(("admin", "editor", "viewer")))],
)
async def get_group_datasets(
    group_id: int,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
):
    result = await use_case.paginate_group_datasets(group_id)
    return result


@router.post(
    "/groups/{group_id}/datasets/upload",
    response_model=DatasetResponseSchema,
    dependencies=[Depends(group_authorization(("admin", "editor")))],
)
async def upload_dataset(
    group_id: int,
    file: UploadFile,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    background_tasks: BackgroundTasks
):
    file_data, kind = await validate_uploaded_pb_file(file)
    dataset = await use_case.upload(group_id, file_data, kind)
    background_tasks.add_task(validate_dataset_reactions, db, dataset.id)
    return dataset


@router.post(
    "/groups/{group_id}/datasets/enumerate",
    response_model=DatasetResponseSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(group_authorization(("admin", "editor")))],
)
async def enumerate_dataset(
    group_id: int,
    payload: DatasetEnumerateCreateSchema,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    background_tasks: BackgroundTasks
):
    dataset = await use_case.enumerate(group_id, payload)
    background_tasks.add_task(validate_dataset_reactions, db, dataset.id)
    return dataset


@router.post(
    "/datasets/{dataset_id}/enumerate/extend",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(dataset_authorization(("admin", "editor")))],
)
async def extend_enumerate_dataset(
    dataset_id: int,
    payload: DatasetEnumerateExtendSchema,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    background_tasks: BackgroundTasks
):
    dataset = await use_case.extend_enumerate(dataset_id, payload)
    background_tasks.add_task(validate_dataset_reactions, db, dataset.id)
    return dataset


@router.get(
    "/datasets/{dataset_id}/download",
    dependencies=[Depends(dataset_authorization(("admin", "editor", "viewer")))],
)
async def download_dataset(
    dataset_id: int,
    file_format: DownloadFileFormats,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
):
    dataset, data = await use_case.download(dataset_id, file_format)
    return Response(
        data,
        headers={"Content-Disposition": f'attachment; filename="{dataset.name}.{file_format}"'}
    )

@router.get("/datasets", response_model=Page[DatasetWithReactionCountResponseSchema])
async def get_user_datasets(
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
):
    return await use_case.paginate_user_datasets()


@router.patch(
    "/datasets/{dataset_id}",
    response_model=DatasetResponseSchema,
    dependencies=[Depends(dataset_authorization(("admin", "editor")))],
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
    response_model=DatasetSharableResponseSchema,
    dependencies=[Depends(dataset_authorization(("admin", "editor", "viewer")))],
)
async def get_dataset(
    dataset_id: int,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
):
    if dataset := await use_case.get(dataset_id):
        return dataset
    raise EntityNotFoundError("Dataset not found")


@router.post(
    "/datasets/{dataset_id}/extend",
    dependencies=[Depends(dataset_authorization(("admin", "editor")))],
)
async def extend_dataset(
    dataset_id: int,
    file: UploadFile,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    background_tasks: BackgroundTasks
):
    file_data, kind = await validate_uploaded_pb_file(file)
    response = await use_case.extend(dataset_id, file_data, kind)
    background_tasks.add_task(validate_dataset_reactions, db)
    return response


@router.get(
    "/datasets/{dataset_id}/groups",
    response_model=list[GroupShareSchema],
    dependencies=[Depends(dataset_authorization(("admin", "editor", "viewer")))],
)
async def get_dataset_groups(
    dataset_id: int,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
):
    if groups := await use_case.get_dataset_groups(dataset_id):
        return groups
    raise EntityNotFoundError("Dataset not found")


@router.post(
    "/groups/{group_id}/datasets/{dataset_id}/share",
    dependencies=[Depends(group_authorization(("admin",)))],
    response_model=DatasetShareSchema
)
async def share_dataset(
    group_id: int,
    dataset_id: int,
    payload: DatasetShareCreateSchema,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
):
    return await use_case.share(group_id, dataset_id, payload)


@router.post(
    "/groups/{group_id}/datasets/{dataset_id}/unshare",
    dependencies=[Depends(group_authorization(("admin",)))],
    status_code=status.HTTP_204_NO_CONTENT
)
async def unshare_dataset(
    group_id: int,
    dataset_id: int,
    payload: DatasetShareCreateSchema,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
):
    await use_case.unshare(group_id, dataset_id, payload)
