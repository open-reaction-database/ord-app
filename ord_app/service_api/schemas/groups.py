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
from pydantic import constr

from ord_app.service_api.models import UserRolesList
from ord_app.service_api.schemas.base import BaseSchema
from ord_app.service_api.schemas.users import UserResponseSchema


class GroupResponseSchema(BaseSchema):
    id: int
    name: str


class GroupUserResponseSchema(BaseSchema):
    id: int
    name: str
    role: UserRolesList


class GroupCreateSchema(BaseSchema):
    name: str | None


class GroupAddMemberSchema(BaseSchema):
    identity: constr(min_length=5)
    role: UserRolesList


class GroupUpdateMemberSchema(BaseSchema):
    user_id: int
    role: UserRolesList


class GroupMemberResponseSchema(BaseSchema):
    role: UserRolesList
    user: UserResponseSchema
