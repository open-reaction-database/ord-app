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
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from starlette import status

from ord_app.service_api.settings import RuntimeSettings

jwks_client = jwt.PyJWKClient(f"https://{RuntimeSettings.auth0_domain}/.well-known/jwks.json")


class UnauthorizedException(HTTPException):
    def __init__(self, detail: str, **kwargs):
        super().__init__(status.HTTP_403_FORBIDDEN, detail=detail, **kwargs)


class UnauthenticatedException(HTTPException):
    def __init__(self, detail: str, **kwargs):
        super().__init__(status.HTTP_401_UNAUTHORIZED, detail=detail, **kwargs)


def verify_access_token(token: HTTPAuthorizationCredentials = Depends(HTTPBearer())) -> dict:
    return _verify_token(
        token,
        algorithms=RuntimeSettings.auth0_algorithms,
        audience=RuntimeSettings.auth0_audience,
        issuer=RuntimeSettings.auth0_issuer,
    )


def verify_id_token(token: HTTPAuthorizationCredentials) -> dict:
    return _verify_token(
        token,
        algorithms=RuntimeSettings.auth0_algorithms,
        audience=RuntimeSettings.auth0_client_id,
        issuer=RuntimeSettings.auth0_issuer,
    )


def _verify_token(token: HTTPAuthorizationCredentials, algorithms: str, audience: str, issuer: str) -> dict:
    if token is None:
        raise UnauthenticatedException

    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token.credentials).key
    except jwt.exceptions.PyJWKClientError as error:
        raise UnauthorizedException(str(error))
    except jwt.exceptions.DecodeError as error:
        raise UnauthorizedException(str(error))

    try:
        payload = jwt.decode(
            token.credentials,
            signing_key,
            algorithms=algorithms,
            audience=audience,
            issuer=issuer,
        )
    except Exception as error:
        raise UnauthorizedException(str(error))

    return payload
