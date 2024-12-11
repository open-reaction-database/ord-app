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

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.models import ReactionModel, UserModel
from ord_app.service_api.schemas.reactions import ReactionCreateSchema


async def get_reactions(db_session: AsyncSession, user: UserModel, dataset_id: int) -> Sequence[ReactionModel]:
    stmt = select(ReactionModel).where(
        ReactionModel.dataset_id == dataset_id,
        ReactionModel.owner == user,
    )
    return (await db_session.scalars(stmt)).all()


async def get_reaction(db_session: AsyncSession, user: UserModel, dataset_id: int, reaction_id: int):
    stmt = (
        select(ReactionModel)
        .where(
            ReactionModel.id == reaction_id,
            ReactionModel.dataset_id == dataset_id,
            ReactionModel.owner == user,
        )
        .limit(1)
    )
    return await db_session.scalar(stmt)


async def create_reaction(db_session: AsyncSession, user: UserModel, dataset_id: int, payload: ReactionCreateSchema):
    reaction = ReactionModel(owner=user, dataset_id=dataset_id, **payload.model_dump())
    db_session.add(reaction)
    await db_session.commit()
    await db_session.refresh(reaction)
    return reaction
