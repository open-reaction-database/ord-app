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

from pydantic import EmailStr, field_validator

from ord_app.service_api.schemas.base import BaseSchema


class UserResponseSchema(BaseSchema):
    id: int
    email: EmailStr | None = None
    name: str | None = None
    external_id: str | None = None
    orcid_id: str | None
    avatar_url: str | None = None

    @field_validator("external_id", mode="after")
    @classmethod
    def _external_id(cls, raw):
        return raw.split("|")[-1] if raw else None  # split auth0 id


class UserCreateSchema(BaseSchema):
    email: EmailStr | None
    auth0_id: str
    name: str | None
    external_id: str | None
    orcid_id: str | None
    avatar_url: str | None


class UserUpdateSchema(BaseSchema):
    email: EmailStr | None = None
    orcid_id: str | None = None
