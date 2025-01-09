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

from sqlalchemy import case, delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.models import GroupModel, UserGroupsMembershipModel, UserModel
from ord_app.service_api.schemas.groups import GroupCreateSchema, GroupMemberCreateSchema, GroupMemberRemoveSchema


async def create_group(db_session: AsyncSession, user: UserModel, payload: GroupCreateSchema):
    # TODO: add response
    group = GroupModel(owner=user, **payload.model_dump(exclude_unset=True))
    db_session.add(group)
    await db_session.flush()

    user_group_member = UserGroupsMembershipModel(user_id=user.id, group_id=group.id, role="admin")
    db_session.add(user_group_member)
    await db_session.commit()
    # await db_session.refresh(stmt)


async def add_group_members(
    db_session: AsyncSession, user: UserModel, group_id: int, payload: GroupMemberCreateSchema
) -> None:
    group_members = []
    for member in payload.members:
        group_members.append(UserGroupsMembershipModel(user_id=member.user_id, group_id=group_id, role=member.role))
    db_session.add_all(group_members)
    await db_session.commit()


async def remove_group_members(
    db_session: AsyncSession, user: UserModel, group_id: int, payload: GroupMemberRemoveSchema
) -> None:

    stmt = delete(UserGroupsMembershipModel).where(
        UserGroupsMembershipModel.user_id.in_(payload.user_ids),
        UserGroupsMembershipModel.group_id == group_id,
    )
    await db_session.execute(stmt)
    await db_session.commit()


async def update_group_members(
    db_session: AsyncSession, user: UserModel, group_id: int, payload: GroupMemberCreateSchema
) -> None:
    # TODO: check if it will work
    role_mapping = case(
        {item["user_id"]: item["role"] for item in payload.members},
        else_=None,
    )

    stmt = (
        update(UserGroupsMembershipModel)
        .where(
            UserGroupsMembershipModel.group_id == group_id,
            UserGroupsMembershipModel.user_id.in_([item["user_id"] for item in payload.members]),
        )
        .values(role=role_mapping)
    )

    await db_session.execute(stmt)
    await db_session.commit()


async def list_groups(db_session: AsyncSession, user: UserModel) -> Sequence[GroupModel]:
    # TODO: groups where user is member
    stmt = (
        select(GroupModel)
        .join(UserGroupsMembershipModel, UserGroupsMembershipModel.group_id == GroupModel.id)
        .where(UserGroupsMembershipModel.user_id == user.id)
    )
    groups = await db_session.scalars(stmt)
    return groups.all()


async def get_group(db_session: AsyncSession, user: UserModel, group_id: int) -> GroupModel:
    query = select(GroupModel).where(GroupModel.owner == user, GroupModel.id == group_id).limit(1)
    group = await db_session.scalar(query)
    return group


async def update_group(
    db_session: AsyncSession, user: UserModel, group_id: int, payload: GroupCreateSchema
) -> GroupModel:
    query = (
        update(GroupModel)
        .where(GroupModel.id == group_id, GroupModel.owner == user)
        .values(payload.model_dump())
        .returning(GroupModel)
    )
    result = await db_session.execute(query)
    await db_session.commit()
    updated_group = result.scalar_one_or_none()
    return updated_group


async def delete_group(db_session: AsyncSession, user: UserModel, group_id: int):
    query = delete(GroupModel).where(GroupModel.id == group_id)
    await db_session.execute(query)
    await db_session.commit()
