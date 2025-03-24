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
from sqlalchemy.orm import joinedload

from ord_app.service_api.models import GroupModel, UserGroupsMembershipModel
from ord_app.service_api.repositories.base import BaseRepository


class GroupRepository(BaseRepository[GroupModel]):
    model = GroupModel

    async def create(self, owner_id: int, payload: dict, autocommit: bool = True) -> GroupModel:
        group = GroupModel(
            owner_id=owner_id,
            groups_member=[UserGroupsMembershipModel(user_id=owner_id, role="admin")],
            **payload
        )

        if autocommit:
            self.db.add(group)
            await self.db.commit()
            await self.db.refresh(group)
            logger.debug(f"{group} created with payload: {payload}")

        return group

    async def get_user_groups(self, user_id: int):
        stmt = (
            select(GroupModel, UserGroupsMembershipModel)
            .join(UserGroupsMembershipModel, UserGroupsMembershipModel.group_id == GroupModel.id)
            .where(UserGroupsMembershipModel.user_id == user_id)
        )
        rows = (await self.db.execute(stmt)).all()
        groups = [
            dict(id=group.id, name=group.name, role=user_group.role)
            for group, user_group in rows
        ]
        return groups


class GroupMembersRepository:
    def __init__(self, db: AsyncSession, autocommit: bool = True):
        self.db = db
        self.autocommit = autocommit

    async def get(self, user_id: int, group_id: int) -> UserGroupsMembershipModel:
        stmt = (
            select(UserGroupsMembershipModel)
            .where(
                UserGroupsMembershipModel.user_id == user_id,
                UserGroupsMembershipModel.group_id == group_id,
            )
            .options(
                joinedload(UserGroupsMembershipModel.user)
            )
            .limit(1)
        )
        result = await self.db.scalar(stmt)
        return result

    async def all(self, group_id: int) -> Sequence[UserGroupsMembershipModel]:
        stmt = (
            select(UserGroupsMembershipModel)
            .where(UserGroupsMembershipModel.group_id == group_id)
            .options(
                joinedload(UserGroupsMembershipModel.user)
            )
        )
        return (await self.db.scalars(stmt)).all()

    async def add_member(self, user_id: int, group_id: int, role: str, autocommit: bool = True):
        value = {"user_id": user_id, "group_id": group_id, "role": role}
        stmt = insert(UserGroupsMembershipModel).values(value)
        if autocommit:
            await self.db.execute(stmt)
            await self.db.commit()
            logger.debug(f"Member {user_id} added to {group_id} with role: {role}")

    async def update_member(self, user_id: int, group_id: int, role: str, autocommit: bool = True):
        stmt = (
            update(UserGroupsMembershipModel)
            .where(
                UserGroupsMembershipModel.user_id == user_id,
                UserGroupsMembershipModel.group_id == group_id,
            )
            .values(role=role)
        )
        if self.autocommit:
            await self.db.execute(stmt)
            await self.db.commit()

    async def upsert(self, user_id: int, group_id: int, role: str, autocommit: bool = True):
        value = {"user_id": user_id, "group_id": group_id, "role": role}
        stmt = insert(UserGroupsMembershipModel).values(value)
        stmt = stmt.on_conflict_do_update(
            index_elements=[UserGroupsMembershipModel.user_id, UserGroupsMembershipModel.group_id],
            set_={"role": stmt.excluded.role},
        )

        if autocommit:
            await self.db.execute(stmt)
            await self.db.commit()
            logger.debug(f"Members upsert: {value}")

    async def remove_members(self, group_id, members_ids: list[int]):
        stmt = delete(UserGroupsMembershipModel).where(
            UserGroupsMembershipModel.group_id == group_id,
            UserGroupsMembershipModel.user_id.in_(members_ids),
        )
        if self.autocommit:
            await self.db.execute(stmt)
            await self.db.commit()
            logger.debug(f"Members removed: {members_ids}")
