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
import httpx
from fastapi.security import HTTPAuthorizationCredentials
from loguru import logger
from sqlalchemy import delete, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.models import GroupModel, UserGroupsMembershipModel, UserModel
from ord_app.service_api.schemas.auth import Auth0CreateSchema
from ord_app.service_api.schemas.users import UserCreateSchema
from ord_app.service_api.services.auth0 import verify_access_token


async def get_user_by_external_pks(
    db_session: AsyncSession,
    external_id: str | None = None,
    external_email: str | None = None,
) -> UserModel:
    stmt = (
        select(UserModel)
        .where(
            or_(
                UserModel.external_id == external_id,
                UserModel.email == external_email,
            )
        )
        .limit(1)
    )
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


async def create_user(db_session: AsyncSession, payload: UserCreateSchema) -> UserModel:
    user = UserModel(**payload.model_dump(exclude_unset=True))
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


async def jit_provisioning(db_session: AsyncSession, payload: Auth0CreateSchema):
    # Decode token
    decoded_token = verify_access_token(HTTPAuthorizationCredentials(scheme="Bearer", credentials=payload.access_token))

    # getting information about the user from the found 'userinfo' link in decoded_token["aud"]
    user_info_api = next(filter(lambda i: "userinfo" in i, decoded_token["aud"]), None)
    async with httpx.AsyncClient() as client:
        response = await client.get(user_info_api, headers={"Authorization": f"Bearer {payload.access_token}"})
        user_info = response.raise_for_status().json()

    logger.debug(f"user_info: {user_info}")

    if user := await get_user_by_external_pks(db_session, user_info["sub"], user_info["email"]):
        logger.info(f"<User(id={user.id})> already exists")
        return user

    external_id = user_info["sub"]
    orcid_id = None
    if "orcid" in user_info["sub"]:
        orcid_id = user_info["sub"].split("|")[-1] if "orcid" in user_info["sub"] else None
    elif "github" in user_info["sub"]:
        external_id = user_info["nickname"]

    user_payload = UserCreateSchema(
        email=user_info["email"] or None,
        name=user_info["name"],
        avatar_url=user_info["picture"],
        external_id=external_id,
        orcid_id=orcid_id
    )
    user = UserModel(**user_payload.model_dump(exclude_unset=True))
    group = GroupModel(name="default", owner=user)
    group_member = UserGroupsMembershipModel(user=user, group=group, role="admin")

    db_session.add_all([user, group, group_member])
    await db_session.commit()
    await db_session.refresh(user)

    logger.info(f"New <User(id={user.id})>, with <Group(id={group.id})> created")

    return user
