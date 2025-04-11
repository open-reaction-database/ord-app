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
from typing import Optional

from fastapi_pagination.ext.sqlalchemy import paginate
from loguru import logger
from sqlalchemy import and_, delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload, with_loader_criteria

from ord_app.service_api.models import (
    DatasetGroupAssociationModel,
    DatasetModel,
    GroupModel,
    ReactionModel,
    UserGroupsMembershipModel,
    UserModel,
)

SELECT_STMT = (
    DatasetModel,
    func.count(ReactionModel.id).label("reaction_count"),
    func.count().filter(ReactionModel.is_valid.is_(False)).label("invalid_reaction_count"),
    func.count().filter(ReactionModel.is_valid.is_(True)).label("valid_reaction_count"),
    func.count().filter(ReactionModel.id.isnot(None), ReactionModel.is_valid.is_(None)).label(
        "none_reaction_count"
    ),
)


class DatasetsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def update_modified_at(self, dataset_id: int):
        stmt = (
            update(DatasetModel)
            .where(DatasetModel.id == dataset_id)
            .values(modified_at=func.now())
            .returning(DatasetModel)
        )
        dataset = await self.db.scalar(stmt)
        await self.db.commit()
        return dataset

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
            .options(
                joinedload(DatasetModel.owner),
                joinedload(DatasetModel.groups),
            )
            .limit(1)
        )
        return await self.db.scalar(stmt)

    async def get_with_sharable_info(self, dataset_id: int, user_id: int):
        stmt = (
            select(*SELECT_STMT)
            .outerjoin(DatasetModel.reactions)
            .where(DatasetModel.id == dataset_id)
            .options(
                # Eager-load related owner, associations, and groups.
                joinedload(DatasetModel.owner),
                joinedload(DatasetModel.groups),
                # Apply loader criteria to filter associations: only include those with is_primary True.
                with_loader_criteria(
                    DatasetGroupAssociationModel,
                    DatasetGroupAssociationModel.is_primary.is_(True),
                    include_aliases=True
                ),
            )
            .group_by(DatasetModel.id)
        )
        dataset, rct_total, rct_invalid, rct_valid, rct_none = (await self.db.execute(stmt)).first()
        dataset.reactions_count = {
            "total": rct_total,
            "invalid": rct_invalid,
            "valid": rct_valid,
            "none": rct_none,
        }

        dataset_associations_stmt = (
            select(DatasetGroupAssociationModel)
            .where(
                DatasetGroupAssociationModel.group_id.in_({group.id for group in dataset.groups}),
                DatasetGroupAssociationModel.dataset_id == dataset.id,
                DatasetGroupAssociationModel.is_primary.is_(True),
                DatasetGroupAssociationModel.group.has(
                    GroupModel.members.any(
                        UserModel.id == user_id
                    )
                )
            )
        )

        dataset.is_sharable = False
        if (await self.db.execute(dataset_associations_stmt)).all():
            dataset.is_sharable = True

        return dataset

    async def get_with_reactions(self, dataset_id: int) -> DatasetModel:
        stmt = (
            select(DatasetModel)
            .where(DatasetModel.id == dataset_id)
            .options(selectinload(DatasetModel.reactions))
        )
        return await self.db.scalar(stmt)

    async def enrich_datasets_with_user_roles(self, datasets, user_id):
        # Collect all group IDs from the paginated datasets
        group_ids = {group.id for dataset in datasets for group in dataset.groups}

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
        for dataset in datasets:
            for group in dataset.groups:
                membership = membership_by_group.get(group.id)
                group.role = membership.role if membership else None
            # filter out groups that the user is not a member of
            dataset.groups = [group for group in dataset.groups if group.role is not None]

    async def datasets_stmt(self, user_id: int, group_id: Optional[int] = None):
        filters = [
            DatasetModel.groups.any(
                GroupModel.members.any(UserModel.id == user_id)
            )
        ]

        if group_id is not None:
            filters.append(
                DatasetModel.groups.any(GroupModel.id == group_id)
            )

        stmt = (
            select(*SELECT_STMT)
            .outerjoin(DatasetModel.reactions)
            .where(and_(*filters))
            .group_by(DatasetModel.id)
            .order_by(DatasetModel.modified_at.desc())
        )

        paginated_datasets = await paginate(self.db, stmt)
        await self.enrich_datasets_with_user_roles(paginated_datasets.items, user_id)

        return paginated_datasets

    async def update(self, dataset_id: int, payload: dict, autocommit: bool = True):
        stmt = (
            update(DatasetModel)
            .where(DatasetModel.id == dataset_id)
            .values(**payload)
        )

        if autocommit:
            await self.db.execute(stmt)
            await self.db.commit()
            logger.debug(f"{dataset_id} updated with payload: {payload}")

    async def delete(self, dataset_id: int):
        stmt = delete(DatasetModel).where(DatasetModel.id == dataset_id)
        await self.db.execute(stmt)
        await self.db.commit()
        logger.debug(f"<Dataset(id={dataset_id})> deleted")

    async def get_dataset_group_association(self, group_id, dataset_id: int):
        dataset_group_association_stmt = (
            select(DatasetGroupAssociationModel)
            .where(
                DatasetGroupAssociationModel.group_id == group_id,
                DatasetGroupAssociationModel.dataset_id == dataset_id,
                DatasetGroupAssociationModel.is_primary.is_(True)
            )
        )
        return await self.db.scalar(dataset_group_association_stmt)

    async def share_dataset(self, primary_dataset_id: int, secondary_group_id: int):
        dataset_group_association = DatasetGroupAssociationModel(
            dataset_id=primary_dataset_id,
            group_id=secondary_group_id,
            is_primary=False
        )
        self.db.add(dataset_group_association)
        await self.db.commit()
        await self.db.refresh(dataset_group_association)
        return dataset_group_association

    async def unshare_dataset(self, primary_dataset_id: int, secondary_group_id: int):
        stmt = delete(DatasetGroupAssociationModel).where(
            DatasetGroupAssociationModel.dataset_id == primary_dataset_id,
            DatasetGroupAssociationModel.group_id == secondary_group_id
        )
        await self.db.execute(stmt)
        await self.db.commit()
