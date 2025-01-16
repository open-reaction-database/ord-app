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
        stmt = select(DatasetModel).where(DatasetModel.id == dataset_id).options(joinedload(DatasetModel.reactions))
        return await self.db.scalar(stmt)

    def group_dataset_stmt(self, group_id: int):
        stmt = (
            select(DatasetModel)
            .join(DatasetGroupAssociationModel, DatasetGroupAssociationModel.dataset_id == DatasetModel.id)
            .where(DatasetGroupAssociationModel.group_id == group_id)
            .options(
                joinedload(DatasetModel.owner),
                joinedload(DatasetModel.reactions).load_only(ReactionModel.id),
            )
        )
        return stmt

    def user_datasets_stmt(self, user_id):
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
        )
        return stmt

    async def create_from_pb(self, group_id, owner_id, dataset_pb, autocommit=True):
        dataset = DatasetModel(owner_id=owner_id, name=dataset_pb.name)
        dataset_group_association = DatasetGroupAssociationModel(dataset=dataset, group_id=group_id)
        self.db.add(dataset_group_association)

        reactions = []
        for reaction in dataset_pb.reactions:
            reactions.append(
                ReactionModel(
                    name=reaction.reaction_id,
                    binpb=reaction.SerializeToString(),
                    dataset=dataset,
                    owner_id=owner_id,
                )
            )

        if autocommit:
            self.db.add_all(reactions)
            await self.db.commit()
            await self.db.refresh(dataset)
        return dataset

    async def update(self, dataset_id: int, payload: dict, autocommit: bool = True):
        stmt = (
            update(DatasetModel)
            .where(DatasetModel.id == dataset_id)
            .values(**payload)
            .returning(DatasetModel)
        )

        if autocommit:
            result = await self.db.scalar(stmt)
            await self.db.commit()
            return result

    async def delete(self, dataset_id: int):
        stmt = delete(DatasetModel).where(DatasetModel.id == dataset_id)
        await self.db.execute(stmt)
        await self.db.commit()
