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
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.users import create_user, get_user_by_external_id
from ord_app.service_api.schemas.auth import Auth0CreateSchema
from ord_app.service_api.schemas.users import UserCreateSchema
from ord_app.service_api.services.auth0 import UnauthorizedException, verify_access_token, verify_id_token
from ord_app.service_api.services.postgresql import get_db_session


async def authenticate(db_session: AsyncSession = Depends(get_db_session), token: dict = Depends(verify_access_token)):
    if user := await get_user_by_external_id(db_session, token["sub"]):
        return user
    raise UnauthorizedException(detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})


async def jit_provisioning(payload: Auth0CreateSchema):
    decoded_access_token = verify_access_token(
        HTTPAuthorizationCredentials(scheme="Bearer", credentials=payload.access_token)
    )

    async for session in get_db_session():
        if user := await get_user_by_external_id(session, decoded_access_token["sub"]):
            return user

        decoded_id_token = verify_id_token(HTTPAuthorizationCredentials(scheme="Bearer", credentials=payload.id_token))
        user_payload = UserCreateSchema(
            email=decoded_id_token.get("email"),
            name=decoded_id_token["name"],
            avatar_url=decoded_id_token["picture"],
            external_id=decoded_id_token["sub"],
        )
        return await create_user(session, user_payload)
