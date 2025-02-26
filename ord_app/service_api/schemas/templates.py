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
from typing import Any

import orjson
from ord_schema.proto.reaction_pb2 import Reaction
from pydantic import BaseModel, Json, field_validator

from ord_app.service_api.domain.datasets import load_message


class TemplateModel(BaseModel):
    id: int
    name: str
    binpb: bytes | Any
    variables: Json

    @field_validator("variables", mode="before")
    @classmethod
    def load_variables(cls, raw):
        return orjson.dumps(raw)


class TemplateCreateModel(BaseModel):
    name: str
    binpb: bytes | Any
    variables: Json

    @field_validator("binpb", mode="after")
    @classmethod
    def load_binpb(cls, raw):
        return load_message(b64decode(raw), Reaction, "binpb")

    def model_dump(self, *args, **kwargs)  -> dict[str, Any]:
        data = super().model_dump(*args, **kwargs)
        data["binpb"] = data["binpb"].SerializeToString()
        return data


class TemplateUpdateModel(BaseModel):
    name: str | None = None
    binpb: bytes | None = None
    variables: Json | None = None

    @field_validator("binpb", mode="after")
    @classmethod
    def load_binpb(cls, raw):
        if raw is not None:
            return load_message(b64decode(raw), Reaction, "binpb")

    def model_dump(self, *args, **kwargs)  -> dict[str, Any]:
        data = super().model_dump(*args, **kwargs)
        if data["binpb"] is not None:
            data["binpb"] = data["binpb"].SerializeToString()
        return data
