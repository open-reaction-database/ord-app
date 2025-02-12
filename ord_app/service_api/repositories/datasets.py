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
from fastapi_pagination.ext.sqlalchemy import paginate
from loguru import logger
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from ord_app.service_api.models import (
    DatasetGroupAssociationModel,
    DatasetModel,
    GroupModel,
    ReactionModel,
    UserGroupsMembershipModel,
)


class DatasetsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        group_id: int,
        owner_id: int,
        payload: dict,
        autocommit=True
    ) -> DatasetModel:
        dataset = DatasetModel(owner_id=owner_id, **payload)
        dataset_group_association = DatasetGroupAssociationModel(dataset=dataset, group_id=group_id)
        self.db.add_all([dataset, dataset_group_association])

        if autocommit:
            logger.debug(f"{dataset} created with payload {payload}")
            await self.db.commit()
            await self.db.refresh(dataset)

        return dataset

    async def get(self, dataset_id: int) -> DatasetModel:
        stmt = (
            select(DatasetModel)
            .where(DatasetModel.id == dataset_id)
            .options(joinedload(DatasetModel.owner))
            .limit(1)
        )
        return await self.db.scalar(stmt)

    async def get_with_reactions(self, dataset_id: int) -> DatasetModel:
        stmt = (
            select(DatasetModel)
            .where(DatasetModel.id == dataset_id)
            .options(joinedload(DatasetModel.reactions))
            .order_by(DatasetModel.modified_at.desc())
        )
        return await self.db.scalar(stmt)

    async def _modify_paginated_datasets(self, paginated_datasets, user_id):
        # wip
        # Collect all group IDs from the paginated datasets
        group_ids = {group.id for dataset in paginated_datasets.items for group in dataset.groups}

        # Query memberships for the specific user and the collected groups
        membership_stmt = (
            select(UserGroupsMembershipModel)
            .where(
                UserGroupsMembershipModel.group_id.in_(group_ids),
                UserGroupsMembershipModel.user_id == user_id
            )
        )
        memberships = await self.db.scalars(membership_stmt)
        membership_by_group = {membership.group_id: membership for membership in memberships.all()}

        # Annotate each group in the paginated datasets with the user role
        for dataset in paginated_datasets.items:
            for group in dataset.groups:
                membership = membership_by_group.get(group.id)
                group.role = membership.role if membership else None
            # filter out groups that the user is not a member of
            dataset.groups = [group for group in dataset.groups if group.role is not None]

        return paginated_datasets

    async def group_dataset_stmt(self, group_id: int, user_id: int):
        # Base query for datasets
        stmt = (
            select(DatasetModel)
            .join(DatasetGroupAssociationModel, DatasetGroupAssociationModel.dataset_id == DatasetModel.id)
            .where(DatasetGroupAssociationModel.group_id == group_id)
            .options(
                joinedload(DatasetModel.owner),
                joinedload(DatasetModel.groups),
                joinedload(DatasetModel.reactions).load_only(ReactionModel.id),
            )
            .order_by(DatasetModel.modified_at.desc())
        )
        paginated_datasets = await paginate(self.db, stmt)
        paginated_datasets = await self._modify_paginated_datasets(paginated_datasets, user_id)

        return paginated_datasets

    async def user_datasets_stmt(self, user_id):
        stmt = (
            select(DatasetModel)
            .distinct()
            .join(DatasetModel.groups)
            .join(GroupModel.members)
            .join(UserGroupsMembershipModel, UserGroupsMembershipModel.group_id == GroupModel.id)
            .where(UserGroupsMembershipModel.user_id == user_id)
            .options(
                joinedload(DatasetModel.owner),
                joinedload(DatasetModel.reactions).load_only(ReactionModel.id),
            )
            .order_by(DatasetModel.modified_at.desc())
        )
        paginated_datasets = await paginate(self.db, stmt)
        paginated_datasets = await self._modify_paginated_datasets(paginated_datasets, user_id)

        return paginated_datasets

    async def update(self, dataset_id: int, payload: dict, autocommit: bool = True):
        stmt = (
            update(DatasetModel)
            .where(DatasetModel.id == dataset_id)
            .values(**payload)
            .returning(DatasetModel)
        )

        if autocommit:
            dataset = await self.db.scalar(stmt)
            await self.db.commit()
            logger.debug(f"{dataset} updated with payload: {payload}")
            return dataset

    async def delete(self, dataset_id: int):
        stmt = delete(DatasetModel).where(DatasetModel.id == dataset_id)
        await self.db.execute(stmt)
        await self.db.commit()
        logger.debug(f"<Dataset(id={dataset_id})> deleted")
