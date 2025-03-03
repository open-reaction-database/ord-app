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
from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import Field, model_validator
from sqlalchemy import Row

from ord_app.service_api.schemas.base import BaseSchema
from ord_app.service_api.schemas.users import UserSchema

DownloadFileFormats = Literal["binpb", "json", "txtpb"]


class DatasetSchema(BaseSchema):
    id: int
    name: str | None = ""
    description: str | None = ""
    created_at: datetime
    modified_at: datetime
    owner: UserSchema


class _DatasetUserGroupSchema(BaseSchema):
    id: int
    name: str
    role: Optional[str] = Field(default=None, alias="role")


class DatasetSharableSchema(DatasetSchema):
    is_sharable: bool
    reaction_count: int = Field(default=0)
    groups: list[_DatasetUserGroupSchema]

    @model_validator(mode="before")
    @classmethod
    def reaction_count(cls, data: Any):  # noqa: F811
        if isinstance(data, (Row, tuple)):
            # first element of the data is Dataset ORM object
            # second is reactions count
            data[0].reaction_count = data[1]
            return data[0]
        return data


class DatasetWithReactionCountSchema(DatasetSchema):
    reaction_count: int = Field(default=0)
    groups: list[_DatasetUserGroupSchema]

    @model_validator(mode="before")
    @classmethod
    def reaction_count(cls, data: Any):  # noqa: F811
        if isinstance(data, (Row, tuple)):
            # first element of the data is Dataset ORM object
            # second is reactions count
            data[0].reaction_count = data[1]
            return data[0]
        return data


class DatasetCreateSchema(BaseSchema):
    name: str | None = ""
    description: str | None = ""


class DatasetShareSchema(BaseSchema):
    group_id: int
    dataset_id: int


class DatasetShareCreateSchema(BaseSchema):
    secondary_group_id: int
