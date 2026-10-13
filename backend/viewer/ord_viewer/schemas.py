# Copyright 2026 Open Reaction Database Project Authors
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

"""The bodies the routes accept and return."""

import base64
from typing import Annotated, Any, Literal

from ord_schema.search.query import Query
from pydantic import BaseModel, Field, field_serializer


class DatasetSummary(BaseModel):
    """One dataset in the corpus, from its source file's footer."""

    dataset_id: str
    name: str
    description: str
    reactions: int


class CompoundCount(BaseModel):
    """How often one compound appears in a dataset, with a molblock to draw it."""

    smiles: str
    molblock: str | None
    count: int


class AuthenticStandardMolblock(BaseModel):
    """A measurement's authentic standard."""

    molblock: str | None


class MeasurementMolblocks(BaseModel):
    """The structures one product measurement names."""

    authentic_standard: AuthenticStandardMolblock


class ProductMolblocks(BaseModel):
    """One product and its measurements' standards."""

    molblock: str | None
    measurements: list[MeasurementMolblocks]


class OutcomeMolblocks(BaseModel):
    """One outcome's products."""

    products: list[ProductMolblocks]


class ReactionMolblocks(BaseModel):
    """A molblock for each compound slot of a reaction; None where none reads."""

    inputs: dict[str, list[str | None]]
    outcomes: list[OutcomeMolblocks]
    workups: list[list[str | None]]


class ReactionRecord(BaseModel):
    """One reaction as the editor returns it: the serialized proto and molblocks."""

    reaction_id: str
    dataset_id: str | None
    # The base64 serialized Reaction, as the source file stores it.
    binpb: str
    molblocks: ReactionMolblocks


class DownloadRequest(BaseModel):
    """The reactions to download: at most one search's worth."""

    reaction_ids: list[str] = Field(min_length=1, max_length=1000)


class SearchRequest(BaseModel):
    """One query in the search grammar, as the form and /ask both produce."""

    query: Query


class ReactionsResult(BaseModel):
    """A plain query's answer: reaction IDs to fetch a page at a time."""

    kind: Literal["reactions"] = "reactions"
    reaction_ids: list[str]
    # True when the corpus's 1,000-row bound may have cut the answer.
    truncated: bool


def _base64_bytes(value: Any) -> Any:
    """Encode the bytes in a cell as standard base64, however deeply nested.

    Args:
        value: A cell: bytes, a list or tuple, a dict, or any other value.

    Returns:
        The value with each bytes replaced by its base64 text; dict keys are left as
        they are, and any other value is returned unchanged.
    """
    if isinstance(value, bytes):
        return base64.b64encode(value).decode()
    if isinstance(value, list | tuple):
        return [_base64_bytes(item) for item in value]
    if isinstance(value, dict):
        return {key: _base64_bytes(item) for key, item in value.items()}
    return value


class TableResult(BaseModel):
    """An aggregate's answer: its group and measure columns; bytes cells are base64."""

    kind: Literal["table"] = "table"
    columns: list[str]
    rows: list[list[Any]]
    truncated: bool

    @field_serializer("rows", when_used="json")
    def _encode_bytes(self, rows: list[list[Any]]) -> list[list[Any]]:
        """Encode bytes cells as standard base64, which JSON has no type for."""
        return [[_base64_bytes(cell) for cell in row] for row in rows]


SearchResult = Annotated[ReactionsResult | TableResult, Field(discriminator="kind")]


class ErrorDetail(BaseModel):
    """The body of an error a route raises itself: a message."""

    detail: str


class ValidationErrors(BaseModel):
    """The body FastAPI answers 422 with when the request fails validation."""

    detail: list[dict[str, Any]]
