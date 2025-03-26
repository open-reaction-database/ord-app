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
import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from loguru import logger
from starlette.concurrency import run_in_threadpool

from ord_app.service_api.services.exceptions import ForbiddenError, UnauthenticatedError
from ord_app.service_api.settings import RuntimeSettings

jwks_client = jwt.PyJWKClient(f"https://{RuntimeSettings.auth0_domain}/.well-known/jwks.json")


async def verify_access_token(token: HTTPAuthorizationCredentials = Depends(HTTPBearer())) -> dict:
    return await _verify_token(
        token,
        algorithms=RuntimeSettings.auth0_algorithms,
        audience=RuntimeSettings.auth0_audience,
        issuer=RuntimeSettings.auth0_issuer,
    )


async def verify_id_token(token: HTTPAuthorizationCredentials) -> dict:
    return await _verify_token(
        token,
        algorithms=RuntimeSettings.auth0_algorithms,
        audience=RuntimeSettings.auth0_client_id,
        issuer=RuntimeSettings.auth0_issuer,
    )


async def _verify_token(token: HTTPAuthorizationCredentials, algorithms: str, audience: str, issuer: str) -> dict:
    if token is None:
        logger.error("token is missing")
        raise UnauthenticatedError

    try:
        signing_key = (await run_in_threadpool(jwks_client.get_signing_key_from_jwt, token.credentials)).key
    except jwt.exceptions.PyJWKClientError as error:
        logger.error(error)
        raise ForbiddenError(str(error)) from error
    except jwt.exceptions.DecodeError as error:
        logger.error(error)
        raise ForbiddenError(str(error)) from error

    try:
        payload = jwt.decode(
            token.credentials,
            signing_key,
            algorithms=algorithms,
            audience=audience,
            issuer=issuer,
            leeway=10
        )
    except Exception as error:
        logger.error(error)
        raise ForbiddenError(str(error)) from error

    logger.debug(f"Token verified: {payload}")

    return payload
