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
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.models import ReactionModel


class ReactionsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, dataset_id: int, user_id: int, payload: dict, autocommit: bool = True):
        reaction = ReactionModel(owner_id=user_id, dataset_id=dataset_id, **payload)

        if autocommit:
            self.db.add(reaction)
            await self.db.commit()
            await self.db.refresh(reaction)

        return reaction

    def all_reactions_stmt(self, dataset_id: int):
        return select(ReactionModel).where(ReactionModel.dataset_id == dataset_id)

    async def get(self, reaction_id):
        stmt = select(ReactionModel).where(ReactionModel.id == reaction_id).limit(1)
        return await self.db.scalar(stmt)

    async def update(self, reaction_id: int, payload: dict, autocommit: bool = True):
        stmt = (
            update(ReactionModel)
            .where(ReactionModel.id == reaction_id)
            .values(**payload)
            .returning(ReactionModel)
        )
        if autocommit:
            result = await self.db.scalar(stmt)
            await self.db.commit()
            return result

    async def bulk_create(self, payload: list[dict], autocommit: bool = True) -> list[ReactionModel]:
        reactions = [ReactionModel(**reaction) for reaction in payload]
        self.db.add_all(reactions)

        if autocommit:
            await self.db.commit()

        return reactions
