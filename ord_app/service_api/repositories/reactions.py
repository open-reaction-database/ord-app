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
from collections.abc import AsyncIterator, Sequence
from itertools import batched

from loguru import logger
from sqlalchemy import Select, exists, insert, or_, select, true, update

from ord_app.service_api.models import ReactionModel
from ord_app.service_api.repositories.base import BaseRepository


class ReactionsRepository(BaseRepository[ReactionModel]):
    model = ReactionModel

    async def get_by_reaction_ids_gen(
        self,
        dataset_id: int,
        pb_reaction_ids: list[str],
        max_num_query_args: int = 10_000,
    ) -> AsyncIterator[ReactionModel]:
        for batch in batched(pb_reaction_ids, max_num_query_args):
            for item in await self.filter(dataset_id=dataset_id, pb_reaction_id=batch):
                yield item

    async def bulk_update(self, values: list[dict]) -> None:
        await self.db.execute(update(ReactionModel), values)
        await self.db.commit()

    async def stream_reactions(
        self, chunk_size: int = 1000, dataset_id: int | None = None
    ) -> AsyncIterator[Sequence[ReactionModel]]:
        last_id = None
        while True:
            stmt = (
                select(ReactionModel)
                .where(
                    ReactionModel.id > last_id if last_id is not None else true(),
                    ReactionModel.dataset_id == dataset_id
                    if dataset_id is not None
                    else true(),
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

    async def stream_binpbs(
        self, dataset_id: int, chunk_size: int = 1000
    ) -> AsyncIterator[Sequence[bytes]]:
        """Yields a dataset's serialized reactions in ``id`` order, a chunk at a time.

        One query reads every chunk through a server-side cursor, so all of them come
        from the same snapshot even when reactions change during the read. The cursor
        stays open until the last chunk is read or the generator is closed.

        Args:
            dataset_id: The dataset whose reactions to read.
            chunk_size: The number of reactions per chunk.

        Yields:
            The ``binpb`` of up to ``chunk_size`` reactions.
        """
        stmt = (
            select(ReactionModel.binpb)
            .where(ReactionModel.dataset_id == dataset_id)
            .order_by(ReactionModel.id)
            .execution_options(yield_per=chunk_size)
        )
        result = await self.db.stream_scalars(stmt)
        try:
            async for chunk in result.partitions():
                yield chunk
        finally:
            await result.close()

    async def any_in_dataset(self, dataset_id: int) -> bool:
        """Returns whether the dataset has any reactions."""
        stmt = select(exists().where(ReactionModel.dataset_id == dataset_id))
        return bool(await self.db.scalar(stmt))

    # Reaction creation needs ownership and dataset context, so this override deliberately
    # takes a wider signature than the base create(payload).
    async def create(  # ty: ignore[invalid-method-override]
        self, dataset_id: int, user_id: int, payload: dict, autocommit: bool = True
    ) -> ReactionModel:
        reaction = ReactionModel(owner_id=user_id, dataset_id=dataset_id, **payload)

        if autocommit:
            self.db.add(reaction)
            await self.db.commit()
            await self.db.refresh(reaction)
            logger.debug(f"{reaction} created with payload: {payload}")

        return reaction

    def all_reactions_stmt(
        self, dataset_id: int, is_valid_query: dict | None = None
    ) -> Select:
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

    async def bulk_create(self, payload: list[dict], autocommit: bool = True) -> None:
        stmt = insert(ReactionModel).values(payload)
        if autocommit:
            await self.db.execute(stmt)
            await self.db.commit()
            logger.debug("Bulk reaction created with payload")

    async def find_duplicated_by_pb_reaction_id(
        self, dataset_id: int, pb_reaction_id: str, exclude_pb_reaction_ids: list[str]
    ) -> ReactionModel | None:
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
