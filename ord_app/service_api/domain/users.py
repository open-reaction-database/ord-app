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
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import delete, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.models import GroupModel, UserGroupsMembershipModel, UserModel
from ord_app.service_api.schemas.auth import Auth0CreateSchema
from ord_app.service_api.schemas.users import UserCreateSchema
from ord_app.service_api.services.auth0 import verify_id_token


async def get_user_by_external_pks(
    db_session: AsyncSession,
    external_id: str = None,
    external_email: str = None,
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
    decoded_id_token = verify_id_token(HTTPAuthorizationCredentials(scheme="Bearer", credentials=payload.id_token))

    # TODO: change `decoded_id_token["sub"]` to ORCID / username
    if user := await get_user_by_external_pks(
        db_session, decoded_id_token.get("nickname"), decoded_id_token.get("email")
    ):
        return user

    user_payload = UserCreateSchema(
        email=decoded_id_token.get("email"),
        name=decoded_id_token["name"],
        avatar_url=decoded_id_token["picture"],
        external_id=decoded_id_token["sub"],  # TODO: change `decoded_id_token["sub"]` to ORCID / username
    )
    user = UserModel(**user_payload.model_dump(exclude_unset=True))
    group = GroupModel(name="default", owner=user)
    group_member = UserGroupsMembershipModel(user=user, group=group, role="admin")

    db_session.add_all([user, group, group_member])
    await db_session.commit()
    await db_session.refresh(user)
    return user
