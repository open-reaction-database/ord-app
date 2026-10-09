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

from ord_app.service_api.domain.auth import (
    authorize_dataset,
    dataset_authorization,
    group_authorization,
)
from ord_app.service_api.domain.datasets import DatasetUseCases, get_dataset_use_case
from ord_app.service_api.domain.reactions import validate_dataset_reactions
from ord_app.service_api.models import (
    DatasetGroupAssociationModel,
    DatasetModel,
    GroupModel,
    UserRolesList,
)
from ord_app.service_api.repositories.users import UserRepository
from ord_app.service_api.resources.v1.responses import (
    DOWNLOAD_MEDIA_TYPES,
    attachment_response,
)
from ord_app.service_api.schemas.datasets import (
    DatasetCreateSchema,
    DatasetDownloadFileFormats,
    DatasetEnumerateCreateSchema,
    DatasetEnumerateExtendSchema,
    DatasetResponseSchema,
    DatasetSharableResponseSchema,
    DatasetShareCreateSchema,
    DatasetShareSchema,
    DatasetWithReactionCountResponseSchema,
    DownloadLinkResponseSchema,
)
from ord_app.service_api.schemas.groups import GroupShareSchema
from ord_app.service_api.services.download_links import (
    InvalidDownloadLinkError,
    sign_download_link,
    verify_download_link,
)
from ord_app.service_api.services.exceptions import EntityNotFoundError, ForbiddenError
from ord_app.service_api.services.pb_utils import (
    MAP_FILE_EXT_TO_DATASET_KIND,
    validate_uploaded_pb_file,
)
from ord_app.service_api.services.postgresql import get_db_session

router = APIRouter(tags=["datasets"])

# Roles that may download a dataset.
DOWNLOAD_ROLES: tuple[UserRolesList, ...] = ("admin", "editor", "viewer")


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
) -> DatasetModel:
    return await use_case.create(group_id, payload)


@router.get(
    "/groups/{group_id}/datasets",
    response_model=Page[DatasetWithReactionCountResponseSchema],
    dependencies=[Depends(group_authorization(("admin", "editor", "viewer")))],
)
async def get_group_datasets(
    group_id: int,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
) -> Page[DatasetModel]:
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
    background_tasks: BackgroundTasks,
) -> DatasetModel:
    file_data, kind = await validate_uploaded_pb_file(
        file, MAP_FILE_EXT_TO_DATASET_KIND
    )
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
    background_tasks: BackgroundTasks,
) -> DatasetModel:
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
    background_tasks: BackgroundTasks,
) -> None:
    # 204 No Content: the extended dataset is computed for the background revalidation
    # task but not returned in the response body.
    dataset = await use_case.extend_enumerate(dataset_id, payload)
    background_tasks.add_task(validate_dataset_reactions, db, dataset.id)


async def _dataset_attachment(
    use_case: DatasetUseCases, dataset_id: int, file_format: DatasetDownloadFileFormats
) -> Response:
    """Returns a dataset as a file download named after it."""
    dataset, data = await use_case.download(dataset_id, file_format)
    return attachment_response(
        data, f"{dataset.name}.{file_format}", DOWNLOAD_MEDIA_TYPES[file_format]
    )


@router.get(
    "/datasets/{dataset_id}/download",
    response_model=None,
    dependencies=[Depends(dataset_authorization(DOWNLOAD_ROLES))],
)
async def download_dataset(
    dataset_id: int,
    file_format: DatasetDownloadFileFormats,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
) -> Response:
    return await _dataset_attachment(use_case, dataset_id, file_format)


@router.post(
    "/datasets/{dataset_id}/download-link",
    dependencies=[Depends(dataset_authorization(DOWNLOAD_ROLES))],
)
async def create_download_link(
    dataset_id: int,
    file_format: DatasetDownloadFileFormats,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
) -> DownloadLinkResponseSchema:
    # The download's checks run here as well, so a dataset that cannot be downloaded
    # fails with an error the UI shows, not as a failed browser download.
    await use_case.prepare_download(dataset_id, file_format)
    token = sign_download_link(dataset_id, file_format, use_case.current_user.id)
    return DownloadLinkResponseSchema(token=token)


@router.get("/downloads/{token}", response_model=None)
async def download_dataset_with_link(
    token: str, db: Annotated[AsyncSession, Depends(get_db_session)]
) -> Response:
    # Authorized by the token rather than a bearer header, so a browser can fetch it
    # directly and save the response as it arrives.
    try:
        link = verify_download_link(token)
    except InvalidDownloadLinkError as error:
        raise ForbiddenError(
            detail="Download link is invalid or has expired"
        ) from error
    user = await UserRepository(db).get(id=link.user_id)
    if user is None:
        raise ForbiddenError(detail="Download link is invalid or has expired")
    await authorize_dataset(db, link.dataset_id, user.id, DOWNLOAD_ROLES)
    return await _dataset_attachment(
        DatasetUseCases(db, user), link.dataset_id, link.file_format
    )


@router.get("/datasets", response_model=Page[DatasetWithReactionCountResponseSchema])
async def get_user_datasets(
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
) -> Page[DatasetModel]:
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
) -> DatasetModel:
    return await use_case.update(dataset_id, payload)


@router.delete(
    "/datasets/{dataset_id}", dependencies=[Depends(dataset_authorization(("admin",)))]
)
async def delete_dataset(
    dataset_id: int,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
) -> str:
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
) -> DatasetModel:
    if dataset := await use_case.get(dataset_id):
        return dataset
    raise EntityNotFoundError("Dataset not found")


@router.post(
    "/datasets/{dataset_id}/extend",
    response_model=None,
    dependencies=[Depends(dataset_authorization(("admin", "editor")))],
)
async def extend_dataset(
    dataset_id: int,
    file: UploadFile,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    background_tasks: BackgroundTasks,
) -> DatasetModel | None:
    file_data, kind = await validate_uploaded_pb_file(
        file, MAP_FILE_EXT_TO_DATASET_KIND
    )
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
) -> list[GroupModel]:
    if groups := await use_case.get_dataset_groups(dataset_id):
        return groups
    raise EntityNotFoundError("Dataset not found")


@router.post(
    "/groups/{group_id}/datasets/{dataset_id}/share",
    dependencies=[Depends(group_authorization(("admin",)))],
    response_model=DatasetShareSchema,
)
async def share_dataset(
    group_id: int,
    dataset_id: int,
    payload: DatasetShareCreateSchema,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
) -> DatasetGroupAssociationModel:
    return await use_case.share(group_id, dataset_id, payload)


@router.post(
    "/groups/{group_id}/datasets/{dataset_id}/unshare",
    dependencies=[Depends(group_authorization(("admin",)))],
    status_code=status.HTTP_204_NO_CONTENT,
)
async def unshare_dataset(
    group_id: int,
    dataset_id: int,
    payload: DatasetShareCreateSchema,
    use_case: Annotated[DatasetUseCases, Depends(get_dataset_use_case)],
) -> None:
    await use_case.unshare(group_id, dataset_id, payload)
