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

from fastapi import APIRouter, Depends, Response
from fastapi_pagination import Page

from ord_app.service_api.database import add_dataset, get_cursor, get_dataset
from ord_app.service_api.domain.auth import dataset_authorization, group_authorization
from ord_app.service_api.domain.reactions import ReactionsUseCase, get_reaction_use_case
from ord_app.service_api.schemas.datasets import DownloadFileFormats
from ord_app.service_api.schemas.reactions import ReactionCreateSchema, ReactionSchema

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
    return await use_case.create(dataset_id, payload)


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
    return await use_case.update(reaction_id, payload)


@router.get(
    "/{reaction_id}/download",
    dependencies=[Depends(dataset_authorization(("admin", "editor", "viewer")))],
)
async def _download_reaction(
    reaction_id: int,
    file_format: DownloadFileFormats,
    use_case: Annotated[ReactionsUseCase, Depends(get_reaction_use_case)],
):
    reaction, data = await use_case.download(reaction_id, file_format)
    return Response(
        data,
        headers={"Content-Disposition": f'attachment; filename="{reaction.name}-{reaction.id}.{file_format}"'},
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
