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

from loguru import logger
from sqlalchemy import delete, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.models import GroupModel, UserGroupsMembershipModel


class GroupRepository:
    def __init__(self, db: AsyncSession, autocommit: bool = True):
        self.db = db
        self.autocommit = autocommit

    async def create(self, owner_id: int, payload: dict):
        group = GroupModel(owner_id=owner_id, **payload)
        user_group_member = UserGroupsMembershipModel(user_id=owner_id, group=group, role="admin")

        if self.autocommit:
            self.db.add_all([group, user_group_member])
            await self.db.commit()
            await self.db.refresh(group)
            logger.debug(f"{group} created with payload: {payload}")
            return group

        return group, user_group_member

    async def get(self, pk: int) -> GroupModel:
        return await self.db.get(GroupModel, pk)

    async def get_user_groups(self, user_id: int) -> Sequence[GroupModel]:
        stmt = (
            select(GroupModel)
            .join(UserGroupsMembershipModel, UserGroupsMembershipModel.group_id == GroupModel.id)
            .where(UserGroupsMembershipModel.user_id == user_id)
        )
        return (await self.db.scalars(stmt)).all()

    async def update(self, group_id: int, payload: dict):
        stmt = update(GroupModel).where(GroupModel.id == group_id).values(payload).returning(GroupModel)

        if self.autocommit:
            result = await self.db.execute(stmt)
            await self.db.commit()
            group = result.scalar_one_or_none()
            logger.debug(f"{group} updated with payload: {payload}")
            return group

    async def delete(self, group_id):
        stmt = delete(GroupModel).where(GroupModel.id == group_id)
        if self.autocommit:
            await self.db.execute(stmt)
            await self.db.commit()
            logger.debug(f"<Group(id={group_id})> deleted")


class GroupMembersRepository:
    def __init__(self, db: AsyncSession, autocommit: bool = True):
        self.db = db
        self.autocommit = autocommit

    async def all(self, group_id: int) -> Sequence[UserGroupsMembershipModel]:
        stmt = select(UserGroupsMembershipModel).where(UserGroupsMembershipModel.group_id == group_id)
        return (await self.db.scalars(stmt)).all()

    async def upsert(self, insert_values: list[dict]):
        stmt = insert(UserGroupsMembershipModel).values(insert_values)
        stmt = stmt.on_conflict_do_update(
            index_elements=[UserGroupsMembershipModel.user_id, UserGroupsMembershipModel.group_id],
            set_={"role": stmt.excluded.role},
        )

        if self.autocommit:
            await self.db.execute(stmt)
            await self.db.commit()
            logger.debug(f"Members upsert: {insert_values}")

    async def remove_members(self, group_id, members_ids: list[int]):
        stmt = delete(UserGroupsMembershipModel).where(
            UserGroupsMembershipModel.group_id == group_id,
            UserGroupsMembershipModel.user_id.in_(members_ids),
        )
        if self.autocommit:
            await self.db.execute(stmt)
            await self.db.commit()
            logger.debug(f"Members removed: {members_ids}")
