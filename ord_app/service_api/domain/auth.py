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
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.users import get_user_by_auth0_id
from ord_app.service_api.models import UserModel
from ord_app.service_api.services.auth0 import UnauthorizedException, verify_id_token, verify_token
from ord_app.service_api.services.postgresql import get_db_session
from ord_app.service_api.settings import RuntimeSettings


async def authenticate(db_session: AsyncSession = Depends(get_db_session), token: dict = Depends(verify_token)):
    if user := await get_user_by_auth0_id(db_session, token["sub"]):
        return user
    raise UnauthorizedException(detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})


async def jit_provisioning(auth0_code: str, redirect_uri: str):
    # verify and decode token
    auth0_token = await retrieve_auth0_token(auth0_code, redirect_uri)
    decoded_auth0_token = verify_token(
        HTTPAuthorizationCredentials(scheme="Bearer", credentials=auth0_token["access_token"])
    )

    # check if user already exists by auth0_id
    async for session in get_db_session():
        if not await get_user_by_auth0_id(session, decoded_auth0_token["sub"]):
            # If this is a new user, it is necessary to obtain information about them.
            # This information is contained in the id_token, which also needs to be validated and decoded.
            await _create_new_user(session, auth0_token["id_token"])
        return auth0_token


async def retrieve_auth0_token(auth0_code: str, redirect_uri: str):
    payload = {
        "client_id": RuntimeSettings.auth0_client_id,
        "client_secret": RuntimeSettings.auth0_client_secret,
        "code": auth0_code,
        "grant_type": "authorization_code",
        "scope": RuntimeSettings.auth0_scope,
        "redirect_uri": redirect_uri,
    }
    async with httpx.AsyncClient(headers={"Accept": "application/json"}) as client:
        response = await client.post(f"https://{RuntimeSettings.auth0_domain}/oauth/token", json=payload)

    return response.raise_for_status().json()


async def _create_new_user(db_session: AsyncSession, id_token: str):
    auth0_decoded_id_token = verify_id_token(HTTPAuthorizationCredentials(scheme="Bearer", credentials=id_token))

    user = UserModel(
        email=auth0_decoded_id_token.get("email"),
        name=auth0_decoded_id_token["name"],
        avatar_url=auth0_decoded_id_token["picture"],
        auth0_id=auth0_decoded_id_token["sub"],
    )
    db_session.add(user)
    await db_session.commit()


async def refresh_auth0_token(token: str):
    payload = {
        "grant_type": "refresh_token",
        "client_id": RuntimeSettings.auth0_client_id,
        "client_secret": RuntimeSettings.auth0_client_secret,
        "scope": "openid profile email offline_access",
        "refresh_token": token,
    }
    async with httpx.AsyncClient(headers={"Accept": "application/x-www-form-urlencoded"}) as client:
        response = await client.post(f"https://{RuntimeSettings.auth0_domain}/oauth/token", json=payload)

    return {"refresh_token": token, **response.raise_for_status().json()}
