# Copyright 2024 Open Reaction Database Project Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
from sqlalchemy import and_, delete, exists, func, or_, select, text, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from ord_app.service_api.models import (
    DatasetGroupAssociationModel,
    DatasetModel,
    ReactionModel,
)
from ord_app.service_api.services.exceptions import (
    ConflictError,
    EntityNotFoundError,
)
from ord_app.service_api.settings import RuntimeSettings


class TrashRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def purge(self) -> None:
        interval = text("make_interval(days => :trash_ttl_days)").bindparams(
            trash_ttl_days=RuntimeSettings.trash_ttl_days
        )
        expired = func.now() - interval
        await self.db.execute(
            delete(ReactionModel).where(ReactionModel.deleted_at < expired)
        )
        has_group = exists().where(
            DatasetGroupAssociationModel.dataset_id == DatasetModel.id
        )
        await self.db.execute(
            delete(DatasetModel).where(
                DatasetModel.deleted_at.is_not(None),
                or_(DatasetModel.deleted_at < expired, ~has_group),
            )
        )

    async def _enforce_cap(self, additional_items: int = 1) -> None:
        if RuntimeSettings.trash_max_items <= 0:
            return
        dataset_count = await self.db.scalar(
            select(func.count())
            .select_from(DatasetModel)
            .where(DatasetModel.deleted_at.is_not(None))
        )
        reaction_count = await self.db.scalar(
            select(func.count())
            .select_from(ReactionModel)
            .join(DatasetModel)
            .where(
                ReactionModel.deleted_at.is_not(None),
                DatasetModel.deleted_at.is_(None),
            )
        )
        if (dataset_count or 0) + (reaction_count or 0) + additional_items > (
            RuntimeSettings.trash_max_items
        ):
            raise ConflictError("Trash is full")

    async def trash_dataset(self, dataset_id: int, user_id: int) -> None:
        await self.purge()
        is_live = await self.db.scalar(
            select(
                exists().where(
                    DatasetModel.id == dataset_id,
                    DatasetModel.deleted_at.is_(None),
                )
            )
        )
        if not is_live:
            raise EntityNotFoundError("Dataset not found")
        independently_trashed_reactions = await self.db.scalar(
            select(func.count())
            .select_from(ReactionModel)
            .where(
                ReactionModel.dataset_id == dataset_id,
                ReactionModel.deleted_at.is_not(None),
            )
        )
        await self._enforce_cap(1 - (independently_trashed_reactions or 0))
        deleted_id = await self.db.scalar(
            update(DatasetModel)
            .where(
                DatasetModel.id == dataset_id,
                DatasetModel.deleted_at.is_(None),
            )
            .values(deleted_at=func.now(), deleted_by_id=user_id)
            .returning(DatasetModel.id)
        )
        if deleted_id is None:
            raise EntityNotFoundError("Dataset not found")
        await self.db.commit()

    async def trash_reaction(
        self, dataset_id: int, reaction_id: int, user_id: int
    ) -> None:
        await self.purge()
        is_live = await self.db.scalar(
            select(
                exists().where(
                    ReactionModel.id == reaction_id,
                    ReactionModel.dataset_id == dataset_id,
                    ReactionModel.deleted_at.is_(None),
                    ReactionModel.dataset.has(DatasetModel.deleted_at.is_(None)),
                )
            )
        )
        if not is_live:
            raise EntityNotFoundError("Reaction not found")
        await self._enforce_cap()
        deleted_id = await self.db.scalar(
            update(ReactionModel)
            .where(
                ReactionModel.id == reaction_id,
                ReactionModel.dataset_id == dataset_id,
                ReactionModel.deleted_at.is_(None),
                ReactionModel.dataset.has(DatasetModel.deleted_at.is_(None)),
            )
            .values(deleted_at=func.now(), deleted_by_id=user_id)
            .returning(ReactionModel.id)
        )
        if deleted_id is None:
            raise EntityNotFoundError("Reaction not found")
        await self.db.commit()

    async def list_group_trash(
        self, group_id: int
    ) -> tuple[list[DatasetModel], list[ReactionModel]]:
        await self.purge()
        datasets = (
            await self.db.scalars(
                select(DatasetModel)
                .join(DatasetGroupAssociationModel)
                .where(
                    DatasetGroupAssociationModel.group_id == group_id,
                    DatasetModel.deleted_at.is_not(None),
                )
                .options(joinedload(DatasetModel.deleted_by))
                .order_by(DatasetModel.deleted_at.desc())
            )
        ).all()
        reactions = (
            await self.db.scalars(
                select(ReactionModel)
                .join(DatasetModel)
                .join(DatasetGroupAssociationModel)
                .where(
                    DatasetGroupAssociationModel.group_id == group_id,
                    DatasetModel.deleted_at.is_(None),
                    ReactionModel.deleted_at.is_not(None),
                )
                .options(joinedload(ReactionModel.deleted_by))
                .order_by(ReactionModel.deleted_at.desc())
            )
        ).all()
        await self.db.commit()
        return list(datasets), list(reactions)

    async def restore_dataset(self, group_id: int, dataset_id: int) -> None:
        restored_id = await self.db.scalar(
            update(DatasetModel)
            .where(
                DatasetModel.id == dataset_id,
                DatasetModel.deleted_at.is_not(None),
                DatasetModel.groups.any(id=group_id),
            )
            .values(deleted_at=None, deleted_by_id=None)
            .returning(DatasetModel.id)
        )
        if restored_id is None:
            raise EntityNotFoundError("Dataset not found in trash")
        await self.db.commit()

    async def restore_reaction(self, group_id: int, reaction_id: int) -> None:
        reaction = await self.db.scalar(
            select(ReactionModel)
            .join(DatasetModel)
            .join(DatasetGroupAssociationModel)
            .where(
                ReactionModel.id == reaction_id,
                ReactionModel.deleted_at.is_not(None),
                DatasetGroupAssociationModel.group_id == group_id,
            )
            .options(joinedload(ReactionModel.dataset))
        )
        if reaction is None:
            raise EntityNotFoundError("Reaction not found in trash")
        if reaction.dataset.deleted_at is not None:
            raise ConflictError("Restore the dataset instead")
        clash = await self.db.scalar(
            select(ReactionModel.id).where(
                ReactionModel.dataset_id == reaction.dataset_id,
                ReactionModel.pb_reaction_id == reaction.pb_reaction_id,
                ReactionModel.deleted_at.is_(None),
            )
        )
        if clash is not None:
            raise ConflictError("Reaction id already in use in this dataset")
        try:
            restored_id = await self.db.scalar(
                update(ReactionModel)
                .where(
                    ReactionModel.id == reaction_id,
                    ReactionModel.deleted_at.is_not(None),
                    ReactionModel.dataset.has(
                        and_(
                            DatasetModel.deleted_at.is_(None),
                            DatasetModel.groups.any(id=group_id),
                        )
                    ),
                )
                .values(deleted_at=None, deleted_by_id=None)
                .returning(ReactionModel.id)
            )
        except IntegrityError as err:
            await self.db.rollback()
            raise ConflictError("Reaction id already in use in this dataset") from err
        if restored_id is None:
            raise EntityNotFoundError("Reaction not found in trash")
        await self.db.commit()

    async def empty(self, group_id: int) -> None:
        associated_dataset_ids = select(DatasetGroupAssociationModel.dataset_id).where(
            DatasetGroupAssociationModel.group_id == group_id
        )
        await self.db.execute(
            delete(ReactionModel).where(
                ReactionModel.deleted_at.is_not(None),
                ReactionModel.dataset_id.in_(associated_dataset_ids),
                ReactionModel.dataset.has(DatasetModel.deleted_at.is_(None)),
            )
        )
        await self.db.execute(
            delete(DatasetModel).where(
                DatasetModel.deleted_at.is_not(None),
                DatasetModel.id.in_(associated_dataset_ids),
            )
        )
        await self.db.commit()
