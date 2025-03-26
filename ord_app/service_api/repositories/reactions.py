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
from itertools import batched

from loguru import logger
from sqlalchemy import insert, or_, select, update

from ord_app.service_api.models import ReactionModel
from ord_app.service_api.repositories.base import BaseRepository


class ReactionsRepository(BaseRepository[ReactionModel]):
    model = ReactionModel

    async def get_by_reaction_ids_gen(
        self,
        dataset_id: int,
        pb_reaction_ids: list[str],
        max_num_query_args=10_000
    ):
        for batch in batched(pb_reaction_ids, max_num_query_args):
            for item in await self.filter(dataset_id=dataset_id, pb_reaction_id=batch):
                yield item

    async def bulk_update(self, values):
        await self.db.execute(update(ReactionModel), values)
        await self.db.commit()

    async def stream_reactions(self, chunk_size: int = 1000, dataset_id: int | None = None):
        last_id = None
        while True:
            stmt = (
                select(ReactionModel)
                .where(
                    ReactionModel.id > last_id if last_id is not None else True,
                    ReactionModel.dataset_id == dataset_id if dataset_id is not None else True,
                    ReactionModel.is_valid.is_(None),
                )
                .order_by(ReactionModel.id)
                .limit(chunk_size)
            )
            reactions = (await self.db.scalars(stmt)).all()
            if not reactions:
                break
            yield reactions
            last_id = reactions[-1].id

    async def create(self, dataset_id: int, user_id: int, payload: dict, autocommit: bool = True):
        reaction = ReactionModel(owner_id=user_id, dataset_id=dataset_id, **payload)

        if autocommit:
            self.db.add(reaction)
            await self.db.commit()
            await self.db.refresh(reaction)
            logger.debug(f"{reaction} created with payload: {payload}")

        return reaction

    def all_reactions_stmt(self, dataset_id: int, is_valid_query: dict | None = None):
        stmt = (
            select(ReactionModel)
            .where(ReactionModel.dataset_id == dataset_id)
            .order_by(ReactionModel.id)
        )

        if is_valid_query is not None:
            or_stmt = []
            for value in is_valid_query.get("is_valid", []):
                or_stmt.append(ReactionModel.is_valid.is_(value))
            if or_stmt:
                stmt = stmt.where(or_(*or_stmt))

        return stmt

    async def bulk_create(self, payload: list[dict], autocommit: bool = True):
        stmt = insert(ReactionModel).values(payload)
        if autocommit:
            await self.db.execute(stmt)
            await self.db.commit()
            logger.debug("Bulk reaction created with payload")

    async def find_duplicated_by_pb_reaction_id(
        self,
        dataset_id: int,
        pb_reaction_id,
        exclude_pb_reaction_ids: list[str]
    ):
        stmt = (
            select(ReactionModel)
            .where(
                ReactionModel.dataset_id == dataset_id,
                ReactionModel.pb_reaction_id == pb_reaction_id,
                ReactionModel.pb_reaction_id.not_in(exclude_pb_reaction_ids),
            )
            .limit(1)
        )
        return await self.db.scalar(stmt)
