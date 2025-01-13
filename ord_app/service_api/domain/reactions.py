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
from typing import Sequence

from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from ord_schema.proto.reaction_pb2 import Reaction
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.datasets import write_message
from ord_app.service_api.models import ReactionModel, UserModel
from ord_app.service_api.schemas.datasets import DownloadFileFormats
from ord_app.service_api.schemas.reactions import ReactionCreateSchema


async def get_reactions(db_session: AsyncSession, user: UserModel, dataset_id: int) -> Sequence[ReactionModel]:
    stmt = select(ReactionModel).where(
        ReactionModel.dataset_id == dataset_id,
        ReactionModel.owner == user,
    )
    return (await db_session.scalars(stmt)).all()


async def update_reactions(
    db_session: AsyncSession,
    reaction_id: int,
    payload: ReactionCreateSchema,
) -> ReactionModel:
    stmt = (
        update(ReactionModel)
        .where(ReactionModel.id == reaction_id)
        .values(**payload.model_dump(exclude_unset=True))
        .returning(ReactionModel)
    )
    result = await db_session.scalar(stmt)
    await db_session.commit()
    return result


async def paginate_reactions(db_session: AsyncSession, dataset_id: int) -> Page[ReactionModel]:
    stmt = select(ReactionModel).where(ReactionModel.dataset_id == dataset_id)
    return await paginate(db_session, stmt)


async def get_reaction(
    db_session: AsyncSession,
    reaction_id: int,
):
    stmt = select(ReactionModel).where(ReactionModel.id == reaction_id).limit(1)
    return await db_session.scalar(stmt)


async def create_reaction(
    db_session: AsyncSession, dataset_id: int, user: UserModel, payload: ReactionCreateSchema
) -> ReactionModel:
    reaction = ReactionModel(owner=user, dataset_id=dataset_id, **payload.model_dump())
    db_session.add(reaction)

    # set default id for Reaction BF
    if reaction.binpb is None:
        await db_session.flush()
        reaction.binpb = Reaction(reaction_id=str(reaction.id)).SerializeToString()

    await db_session.commit()
    await db_session.refresh(reaction)
    return reaction


async def download_reaction(
    db_session: AsyncSession,
    reaction_id: int,
    file_format: DownloadFileFormats,
) -> tuple[ReactionModel, bytes]:
    reaction = await get_reaction(db_session, reaction_id)
    data = write_message(Reaction.FromString(reaction.binpb), kind=file_format)
    return reaction, data
