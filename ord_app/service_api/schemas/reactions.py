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
from base64 import b64decode, b64encode

from ord_schema.proto.reaction_pb2 import Reaction
from pydantic import field_validator

from ord_app.service_api.domain.datasets import load_message
from ord_app.service_api.schemas.base import BaseSchema


class ReactionSchema(BaseSchema):
    id: int
    name: str | None
    binpb: str

    @field_validator("binpb", mode="before")
    @classmethod
    def _binpb(cls, raw):
        return b64encode(raw).decode()


class ReactionCreateSchema(BaseSchema):
    name: str | None
    binpb: bytes

    @field_validator("binpb", mode="after")
    @classmethod
    def binpb_validation(cls, raw):
        return load_message(b64decode(raw), Reaction, "binpb").SerializeToString()
