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

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Response, UploadFile, status
from fastapi_pagination import Page
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.database import add_dataset, get_cursor, get_dataset
from ord_app.service_api.domain.auth import dataset_authorization, group_authorization
from ord_app.service_api.domain.reactions import ReactionsUseCase, get_reaction_use_case, validate_reactions_task
from ord_app.service_api.schemas.datasets import DownloadFileFormats
from ord_app.service_api.schemas.reactions import ReactionCreateSchema, ReactionSchema
from ord_app.service_api.services.exceptions import EntityNotFoundError, ProtobufDecodeError, UniqueViolation
from ord_app.service_api.services.pb_utils import validate_uploaded_pb_file
from ord_app.service_api.services.postgresql import get_db_session

router = APIRouter(tags=["reactions"], prefix="/datasets/{dataset_id}/reactions")


@router.post(
    "",
    dependencies=[Depends(dataset_authorization(("admin", "editor")))],
    response_model=ReactionSchema,
)
async def create_reaction(
    dataset_id: int,
    payload: ReactionCreateSchema,
    use_case: Annotated[ReactionsUseCase, Depends(get_reaction_use_case)],
):
    try:
        return await use_case.create(dataset_id, payload)
    except UniqueViolation as err:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(err)) from err

@router.post(
    "/upload",
    dependencies=[Depends(dataset_authorization(("admin", "editor")))],
    response_model=ReactionSchema,
)
async def upload_reaction(
    dataset_id: int,
    file: UploadFile,
    use_case: Annotated[ReactionsUseCase, Depends(get_reaction_use_case)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    background_tasks: BackgroundTasks
):
    file_data, kind = await validate_uploaded_pb_file(file)

    try:
        response =  await use_case.upload(dataset_id, file_data, kind)
        background_tasks.add_task(validate_reactions_task, db)
        return response
    except ProtobufDecodeError as err:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(err)) from err


@router.get(
    "",
    dependencies=[Depends(dataset_authorization(("admin", "editor", "viewer")))],
    response_model=Page[ReactionSchema],
)
async def reactions(
    dataset_id: int,
    use_case: Annotated[ReactionsUseCase, Depends(get_reaction_use_case)],
):
    return await use_case.paginate(dataset_id)


@router.get(
    "/{reaction_id}",
    dependencies=[Depends(dataset_authorization(("admin", "editor", "viewer")))],
    response_model=ReactionSchema,
)
async def reaction(
    reaction_id: int,
    use_case: Annotated[ReactionsUseCase, Depends(get_reaction_use_case)],
):
    return await use_case.get(reaction_id)


@router.patch(
    "/{reaction_id}",
    dependencies=[Depends(dataset_authorization(("admin", "editor")))],
    response_model=ReactionSchema,
)
async def _update_reaction(
    reaction_id: int,
    payload: ReactionCreateSchema,
    use_case: Annotated[ReactionsUseCase, Depends(get_reaction_use_case)],
):
    try:
        return await use_case.update(reaction_id, payload)
    except UniqueViolation as err:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(err)) from err
    except EntityNotFoundError as err:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(err)) from err


@router.get(
    "/{reaction_id}/download",
    dependencies=[Depends(dataset_authorization(("admin", "editor", "viewer")))],
)
async def _download_reaction(
    reaction_id: int,
    file_format: DownloadFileFormats,
    use_case: Annotated[ReactionsUseCase, Depends(get_reaction_use_case)],
):
    try:
        reaction, data = await use_case.download(reaction_id, file_format)
    except EntityNotFoundError as err:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(err)) from err
    filename = f"{reaction.pb_reaction_id}-{reaction.id}.{file_format}"
    return Response(
        data,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/clone_reaction", dependencies=[Depends(group_authorization(("admin", "editor")))])
def clone_reaction(user_id: str, dataset_name: str, index: int):
    """WIP"""
    with get_cursor() as cursor:
        dataset = get_dataset(user_id, dataset_name, cursor)
        if dataset is None:
            return Response(status_code=404)
        dataset.reactions.add().CopyFrom(dataset.reactions[index])
        add_dataset(user_id, dataset, cursor)
    return len(dataset.reactions) - 1  # Index of the new reaction.


@router.get("/delete_reaction", dependencies=[Depends(group_authorization(("admin",)))])
def delete_reaction(user_id: str, dataset_name: str, index: int):
    """WIP"""
    with get_cursor() as cursor:
        dataset = get_dataset(user_id, dataset_name, cursor)
        if dataset is None:
            return Response(status_code=404)
        del dataset.reactions[index]
        add_dataset(user_id, dataset, cursor)
    return Response(status_code=200)
