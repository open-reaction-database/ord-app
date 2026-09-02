# Copyright 2024 Open Reaction Database Project Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.auth import authenticate
from ord_app.service_api.models import DatasetModel, ReactionModel, UserModel
from ord_app.service_api.repositories.trash import TrashRepository
from ord_app.service_api.schemas.trash import TrashRestoreSchema
from ord_app.service_api.services.postgresql import get_db_session


class TrashUseCases:
    def __init__(self, db: AsyncSession) -> None:
        self.repository = TrashRepository(db)

    async def list(
        self, group_id: int
    ) -> dict[str, list[DatasetModel] | list[ReactionModel]]:
        datasets, reactions = await self.repository.list_group_trash(group_id)
        return {"datasets": datasets, "reactions": reactions}

    async def restore(self, group_id: int, payload: TrashRestoreSchema) -> None:
        if payload.kind == "dataset":
            await self.repository.restore_dataset(group_id, payload.id)
        else:
            await self.repository.restore_reaction(group_id, payload.id)

    async def empty(self, group_id: int) -> None:
        await self.repository.empty(group_id)


def get_trash_use_case(
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(authenticate),
) -> TrashUseCases:
    return TrashUseCases(db)
