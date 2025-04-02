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
from base64 import b64decode
from datetime import datetime
from typing import Any, Literal, Optional
from uuid import uuid4

from pydantic import Field, constr, field_validator, model_validator
from sqlalchemy import Row

from ord_app.service_api.schemas.base import MAX_CRITICAL_FIELD_LENGTH, MAX_FIELD_LENGTH, BaseSchema
from ord_app.service_api.schemas.users import UserResponseSchema

DownloadFileFormats = Literal["binpb", "json", "txtpb"]


class DatasetResponseSchema(BaseSchema):
    id: int
    name: str
    description: str | None
    created_at: datetime
    modified_at: datetime
    owner: UserResponseSchema


class _DatasetResponseUserGroupSchema(BaseSchema):
    id: int
    name: str
    role: Optional[str] = Field(default=None, alias="role")


class _DatasetReactionCountingSchema(BaseSchema):
    total: int = Field(default=0)
    invalid: int = Field(default=0)
    valid: int = Field(default=0)
    none: int = Field(default=0)


class DatasetSharableResponseSchema(DatasetResponseSchema):
    is_sharable: bool
    groups: list[_DatasetResponseUserGroupSchema]
    reactions_count: _DatasetReactionCountingSchema


class DatasetWithReactionCountResponseSchema(DatasetResponseSchema):
    groups: list[_DatasetResponseUserGroupSchema]

    reactions_count: _DatasetReactionCountingSchema

    @model_validator(mode="before")
    @classmethod
    def reaction_count(cls, data: Any):  # noqa: F811
        if isinstance(data, (Row, tuple)):
            dataset, rct_total, rct_invalid, rct_valid, rct_none = data
            # first element of the data is Dataset ORM object
            # second is reactions count
            data[0].reactions_count = _DatasetReactionCountingSchema(
                total=rct_total,
                invalid=rct_invalid,
                valid=rct_valid,
                none=rct_none,
            )
            return data[0]
        return data



class DatasetCreateSchema(BaseSchema):
    name: constr(max_length=MAX_CRITICAL_FIELD_LENGTH)
    description: constr(max_length=MAX_FIELD_LENGTH) | None = ""

    @field_validator("name", mode="before")
    def set_name_default(cls, value: str | None) -> str:
        if value := (value or "").strip():
            return value
        return uuid4().hex


class DatasetEnumerateCreateSchema(BaseSchema):
    name: constr(max_length=MAX_CRITICAL_FIELD_LENGTH)
    description: constr(max_length=MAX_FIELD_LENGTH) | None = ""
    reactions: list[bytes]

    @field_validator("reactions", mode="before")
    def load_reactions(cls, raw):
        return map(b64decode, raw)


class DatasetEnumerateExtendSchema(BaseSchema):
    reactions: list[bytes]

    @field_validator("reactions", mode="before")
    def load_reactions(cls, raw):
        return map(b64decode, raw)


class DatasetShareSchema(BaseSchema):
    group_id: int
    dataset_id: int


class DatasetShareCreateSchema(BaseSchema):
    secondary_group_id: int
