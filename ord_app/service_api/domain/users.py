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

import httpx
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.auth import authenticate
from ord_app.service_api.models import GroupModel, UserGroupsMembershipModel, UserModel
from ord_app.service_api.repositories.groups import GroupRepository
from ord_app.service_api.repositories.users import UserRepository
from ord_app.service_api.schemas.auth import Auth0CreateSchema
from ord_app.service_api.schemas.users import UserCreateSchema, UserUpdateSchema
from ord_app.service_api.services.auth0 import verify_access_token
from ord_app.service_api.services.exceptions import EntityNotFoundError, UnauthorizedError, psycopg_error_wrapper
from ord_app.service_api.services.postgresql import get_db_session


class UserUseCase:
    def __init__(self, db: AsyncSession, current_user: UserModel | None = None):
        self.db = db
        self.current_user = current_user
        self.user_repo = UserRepository(db)
        self.group_repo = GroupRepository(db)

    async def get(self, user_id: int) -> UserModel:
        if user := await self.user_repo.get(id=user_id):
            return user
        raise EntityNotFoundError(f"User {user_id} not found")

    async def get_user_by_auth0_id(self, auth0_id: str) -> Optional[UserModel]:
        return await self.user_repo.get(auth0_id=auth0_id)

    async def update(self, user_id: int, payload: UserUpdateSchema):
        if self.current_user.id != user_id:
            raise UnauthorizedError("Action prohibited")
        if user := await self.user_repo.update(payload.model_dump(exclude_unset=True), id=user_id):
            return user
        raise EntityNotFoundError(f"User {user_id} not found")


def get_user_use_case(
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(authenticate),
) -> UserUseCase:
    """
    A factory function that retrieves `db` and `current_user` via Depends,
    and then returns a fully initialized UseCase without any mention of Depends inside the UseCase itself.
    """
    return UserUseCase(db=db, current_user=current_user)


@psycopg_error_wrapper
async def jit_provisioning(db_session: AsyncSession, payload: Auth0CreateSchema):
    user_use_case = UserUseCase(db_session)

    # Decode token
    decoded_token = await verify_access_token(HTTPAuthorizationCredentials(scheme="Bearer", credentials=payload.access_token))

    # getting information about the user from the found 'userinfo' link in decoded_token["aud"]
    user_info_api = next(filter(lambda i: "userinfo" in i, decoded_token["aud"]), None)
    async with httpx.AsyncClient() as client:
        response = await client.get(user_info_api, headers={"Authorization": f"Bearer {payload.access_token}"})
        user_info = response.raise_for_status().json()

    logger.debug(f"user_info: {user_info}")
    if "sub" not in user_info:
        raise UnauthorizedError("sub is not provided")

    external_id = user_info["sub"]
    orcid_id = None
    if "orcid" in user_info["sub"]:
        orcid_id = user_info["sub"].split("|")[-1] if "orcid" in user_info["sub"] else None
    elif "github" in user_info["sub"]:
        external_id = user_info["nickname"]

    user_payload = UserCreateSchema(
        email=user_info.get("email") or None,
        name=user_info.get("name") or None,
        avatar_url=user_info.get("picture") or None,
        external_id=external_id,
        orcid_id=orcid_id,
        auth0_id=user_info["sub"]
    )

    if user := await user_use_case.get_user_by_auth0_id(user_info["sub"]):
        logger.debug(f"<User(id={user.id})> already exists")
        return await user_use_case.user_repo.update(
            payload=user_payload.model_dump(exclude_unset=True),
            id=user.id
        )

    user = UserModel(**user_payload.model_dump(exclude_unset=True))
    group = GroupModel(name="default", owner=user)
    group_member = UserGroupsMembershipModel(user=user, group=group, role="admin")

    db_session.add_all([user, group, group_member])
    await db_session.commit()
    await db_session.refresh(user)

    logger.info(f"New <User(id={user.id})>, with <Group(id={group.id})> created")

    return user
