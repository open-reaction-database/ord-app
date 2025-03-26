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
from typing import Any

from ord_schema.message_helpers import molblock_from_compound
from ord_schema.proto.reaction_pb2 import Reaction
from pydantic import ConfigDict, Field, field_validator, model_validator

from ord_app.service_api.domain.datasets import load_message
from ord_app.service_api.schemas.base import BaseSchema


class _ReactionValidation(BaseSchema):
    errors: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class ReactionsQueryParams(BaseSchema):
    is_valid: list[bool | None] | None = None

    @field_validator("is_valid", mode="before")
    def convert_str_to_bool(cls, v):
        if isinstance(v, str):
            return cls.parse_bool(v)
        elif isinstance(v, list):
            return [cls.parse_bool(v) for v in v]
        return v


def safe_molblock(product):
    try:
        return molblock_from_compound(product)
    except ValueError:
        return None


def get_molblocks(pb):
    outcomes = []

    for outcome in pb.outcomes:
        outcome_item = []
        for product in outcome.products:
            product_item = {
                "molblock": safe_molblock(product),
                "measurements": []
            }
            for measurement in product.measurements:
                product_item["measurements"].append({
                    "authentic_standard": {
                        "molblock": safe_molblock(measurement.authentic_standard)
                    },
                })

            outcome_item.append(product_item)
        outcomes.append({"products": outcome_item})

    inputs = {
        key: [safe_molblock(component) for component in value.components]
        for key, value in pb.inputs.items()
    }
    return {"outcomes": outcomes, "inputs": inputs}


class ReactionResponseSchema(BaseSchema):
    id: int
    pb_reaction_id: str
    binpb: str
    is_valid: bool | None
    validation: _ReactionValidation | None = None
    summary: dict = Field(
        default_factory=lambda: {
            "provenance": {"doi": "foo"},
            "summary": {"yield": 25.5},
            "conditions": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis."
        }
    )
    molblocks: dict

    @field_validator("binpb", mode="before")
    @classmethod
    def _binpb(cls, raw):
        return b64encode(raw).decode()

    @model_validator(mode="before")
    @classmethod
    def _fill_molblocks(cls, data: Any):
        data.molblocks = get_molblocks(load_message(data.binpb, Reaction, "binpb"))
        return data

    @model_validator(mode="before")
    @classmethod
    def reaction_count(cls, data: Any):  # noqa: F811
        if hasattr(data, "reactions"):
            data.reaction_count = len(data.reactions)
        return data


class ReactionCreateSchema(BaseSchema):
    binpb: bytes

    @field_validator("binpb", mode="before")
    def load_binpb(cls, raw):
        return b64decode(raw)


class ReactionUpdateSchema(BaseSchema):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    binpb: bytes

    @field_validator("binpb", mode="before")
    def load_binpb(cls, raw):
        return b64decode(raw)
