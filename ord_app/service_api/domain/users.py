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

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.models import UserModel


async def get_user_by_auth0_id(db_session: AsyncSession, auth0_id: str) -> UserModel:
    stmt = select(UserModel).where(UserModel.auth0_id == auth0_id).limit(1)
    return await db_session.scalar(stmt)


async def get_user_by_email(db_session: AsyncSession, email: str):
    stmt = select(UserModel).where(UserModel.email == email).limit(1)
    return await db_session.scalar(stmt)


async def get_user_uc(db_session: AsyncSession, user_id: int) -> UserModel:
    stmt = select(UserModel).where(UserModel.id == user_id)
    user = await db_session.scalar(stmt)
    return user


async def delete_user_uc(db_session: AsyncSession, user_id: int) -> int:
    stmt = delete(UserModel).where(UserModel.id == user_id)
    result = await db_session.execute(stmt)
    await db_session.commit()
    return result.rowcount
