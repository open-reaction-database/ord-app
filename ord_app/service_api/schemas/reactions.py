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
from collections import defaultdict
from itertools import chain
from typing import Any

from ord_schema.message_helpers import molblock_from_compound
from ord_schema.proto.reaction_pb2 import Reaction
from pydantic import ConfigDict, Field, field_validator, model_validator

from ord_app.service_api.domain.datasets import load_message
from ord_app.service_api.schemas.base import BaseSchema


class _ReactionValidation(BaseSchema):
    errors: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class ReactionSchema(BaseSchema):
    id: int
    pb_reaction_id: str
    binpb: str
    is_valid: bool | None
    validation: _ReactionValidation | None = None
    summary: dict = Field(default_factory=lambda: {"provenance": {"doi": "foo"}, "summary": {"yield": 25.5}})
    molblocks: dict

    @field_validator("binpb", mode="before")
    @classmethod
    def _binpb(cls, raw):
        return b64encode(raw).decode()

    @model_validator(mode="before")
    @classmethod
    def _fill_molblocks(cls, data: Any):
        pb = load_message(data.binpb, Reaction, "binpb")

        products = []
        for product in chain.from_iterable(outcome.products for outcome in pb.outcomes):
            try:
                products.append(molblock_from_compound(product))
            except ValueError:
                products.append(None)

        inputs = defaultdict(list)
        for input_key, input_value in pb.inputs.items():
            for component in input_value.components:
                try:
                    inputs[input_key].append(molblock_from_compound(component))
                except ValueError:
                    inputs[input_key].append(None)

        data.molblocks = {"products": products, "inputs": inputs}
        return data

    @model_validator(mode="before")
    @classmethod
    def reaction_count(cls, data: Any):  # noqa: F811
        if hasattr(data, "reactions"):
            data.reaction_count = len(data.reactions)
        return data


class ReactionCreateSchema(BaseSchema):
    binpb: bytes | None = None

    @field_validator("binpb", mode="after")
    @classmethod
    def binpb_validation(cls, raw):
        return None if raw is None else load_message(b64decode(raw), Reaction, "binpb").SerializeToString()


class ReactionUpdateSchema(BaseSchema):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    binpb: bytes | Any

    @field_validator("binpb", mode="after")
    @classmethod
    def load_binpb(cls, raw):
        return load_message(b64decode(raw), Reaction, "binpb")

    def model_dump(self, *args, **kwargs)  -> dict[str, Any]:
        data = super().model_dump(*args, **kwargs)
        data["binpb"] = data["binpb"].SerializeToString()
        return data
