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
from uuid import uuid4

from fastapi import APIRouter, Depends, Response
from fastapi_pagination import Page
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.database import add_dataset, get_cursor, get_dataset
from ord_app.service_api.domain.auth import get_current_user
from ord_app.service_api.domain.datasets import write_message
from ord_app.service_api.domain.reactions import create_reaction, get_reaction, get_reactions, paginate_reactions
from ord_app.service_api.models import UserModel
from ord_app.service_api.schemas.reactions import ReactionCreateSchema, ReactionSchema
from ord_app.service_api.services.postgresql import get_db_session

router = APIRouter(tags=["reactions"])


@router.get("/datasets/{dataset_id}/reactions", response_model=Page[ReactionSchema])
async def reactions(
    dataset_id: int,
    user: UserModel = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await paginate_reactions(db_session, user, dataset_id)


@router.get("/datasets/{dataset_id}/reactions/{reaction_id}", response_model=ReactionSchema)
async def reaction(
    dataset_id: int,
    reaction_id: int,
    user: UserModel = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await get_reaction(db_session, user, dataset_id, reaction_id)


@router.get("/download_reaction")
async def download_reaction(user_id: str, dataset_name: str, index: int, kind: str):
    """WIP"""
    with get_cursor() as cursor:
        dataset = get_dataset(user_id, dataset_name, cursor)
    if dataset is None:
        return Response(status_code=404)
    data = write_message(dataset.reactions[index], kind=kind)
    return Response(
        gzip.compress(data),
        headers={"Content-Disposition": f'attachment; filename="{dataset_name}-{index}.{kind}.gz"'},
        media_type="application/gzip",
    )


@router.post("/datasets/{dataset_id}/reactions", response_model=ReactionSchema)
async def _create_reaction(
    dataset_id: int,
    payload: ReactionCreateSchema,
    user: UserModel = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await create_reaction(db_session, user, dataset_id, payload)


@router.get("/clone_reaction")
def clone_reaction(user_id: str, dataset_name: str, index: int):
    """WIP"""
    with get_cursor() as cursor:
        dataset = get_dataset(user_id, dataset_name, cursor)
        if dataset is None:
            return Response(status_code=404)
        dataset.reactions.add().CopyFrom(dataset.reactions[index])
        add_dataset(user_id, dataset, cursor)
    return len(dataset.reactions) - 1  # Index of the new reaction.


@router.get("/delete_reaction")
def delete_reaction(user_id: str, dataset_name: str, index: int):
    """WIP"""
    with get_cursor() as cursor:
        dataset = get_dataset(user_id, dataset_name, cursor)
        if dataset is None:
            return Response(status_code=404)
        del dataset.reactions[index]
        add_dataset(user_id, dataset, cursor)
    return Response(status_code=200)
