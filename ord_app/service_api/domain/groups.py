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

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.auth import authenticate
from ord_app.service_api.models import GroupModel, UserGroupsMembershipModel, UserModel
from ord_app.service_api.repositories.groups import GroupMembersRepository, GroupRepository
from ord_app.service_api.schemas.groups import GroupCreateSchema, GroupMemberEditSchema
from ord_app.service_api.services.postgresql import get_db_session


class GroupUseCases:
    def __init__(self, db: AsyncSession, current_user: UserModel):
        self.db = db
        self.current_user = current_user
        self.group_repository = GroupRepository(db)

    async def create(self, payload: GroupCreateSchema):
        return await self.group_repository.create(self.current_user.id, payload.model_dump(exclude_unset=True))

    async def get(self, group_id: int) -> GroupModel:
        return await self.group_repository.get(group_id)

    async def user_groups(self) -> Sequence[GroupModel]:
        return await self.group_repository.get_user_groups(self.current_user.id)

    async def update(self, group_id: int, payload: GroupCreateSchema) -> GroupModel:
        return await self.group_repository.update(group_id, payload.model_dump(exclude_unset=True))

    async def delete(self, group_id: int):
        await self.group_repository.delete(group_id)


class GroupMembersUseCases:
    def __init__(self, db: AsyncSession = Depends(get_db_session), current_user: UserModel = Depends(authenticate)):
        self.db = db
        self.current_user = current_user
        self.group_members_repository = GroupMembersRepository(db)

    async def all(self, group_id: int) -> Sequence[UserGroupsMembershipModel]:
        return await self.group_members_repository.all(group_id)

    async def upsert(self, group_id: int, payload: list[GroupMemberEditSchema]):
        insert_values = [{"user_id": member.user_id, "group_id": group_id, "role": member.role} for member in payload]
        await self.group_members_repository.upsert(insert_values)

    async def remove_members(self, group_id: int, members_ids: list[int]):
        await self.group_members_repository.remove_members(group_id, members_ids)


def get_group_use_case(
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(authenticate),
) -> GroupUseCases:
    """
    A factory function that retrieves `db` and `current_user` via Depends,
    and then returns a fully initialized UseCase without any mention of Depends inside the UseCase itself.
    """
    return GroupUseCases(db=db, current_user=current_user)


def get_group_members_use_case(
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(authenticate),
) -> GroupMembersUseCases:
    return GroupMembersUseCases(db=db, current_user=current_user)
