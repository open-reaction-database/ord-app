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
from datetime import UTC, datetime, timedelta

from pydantic import EmailStr, Field

from ord_app.service_api.models import AuthProviders
from ord_app.service_api.schemas.base import BaseSchema
from ord_app.service_api.settings import RuntimeSettings


class GitHubUserSchema(BaseSchema):
    login: str
    id: int
    avatar_url: str
    name: str | None = None
    email: EmailStr | None = None


class OAuthJWTSchema(BaseSchema):
    sub: EmailStr
    provider: AuthProviders
    provider_access_token: str | None = None
    exp: int = Field(
        default_factory=lambda: round(
            (datetime.now(UTC) + timedelta(minutes=RuntimeSettings.JWT_ACCESS_TOKEN_EXPIRE)).timestamp()
        )
    )


class JWTAccessTokenSchema(BaseSchema):
    access_token: str
    token_type: str
    expires_in: int


class Auth0Schema(BaseSchema):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str


class Auth0RefreshTokenSchema(BaseSchema):
    refresh_token: str
