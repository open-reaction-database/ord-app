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
import datetime
from typing import Annotated, Any, Literal

from ord_schema.search import execute
from ord_schema.search.query import Query
from pydantic import BaseModel, ConfigDict, Field, field_serializer


class DatasetSummary(BaseModel):
    """One dataset in the corpus, from its source file's footer."""

    dataset_id: str
    name: str
    description: str
    reactions: int


class NewestDataset(DatasetSummary):
    """The corpus's most recently submitted dataset."""

    # The day ord-data's submission pipeline took it in.
    submitted: datetime.date


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

    model_config = ConfigDict(extra="forbid")

    reaction_ids: list[str] = Field(min_length=1, max_length=execute.DEFAULT_MAX_ROWS)


class SearchRequest(BaseModel):
    """One query in the search grammar, as the form and /ask both produce."""

    model_config = ConfigDict(extra="forbid")

    query: Query


_TRUNCATED = (
    f"True when the corpus's bound of {execute.DEFAULT_MAX_ROWS:,} rows may have cut "
    "the answer short"
)


class ReactionsResult(BaseModel):
    """A plain query's answer: reaction IDs to fetch a page at a time."""

    # The published schema lists kind as required, since every answer carries it.
    model_config = ConfigDict(json_schema_serialization_defaults_required=True)

    kind: Literal["reactions"] = "reactions"
    reaction_ids: list[str] = Field(
        max_length=execute.DEFAULT_MAX_ROWS,
        description=(
            f"The IDs of the matching reactions, at most {execute.DEFAULT_MAX_ROWS:,}"
        ),
    )
    truncated: bool = Field(description=_TRUNCATED)


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


# An aggregate's rows, as many as the corpus returns at most. The JSON serializer below
# returns this type too, so the published schema keeps the bound.
_Rows = Annotated[list[list[Any]], Field(max_length=execute.DEFAULT_MAX_ROWS)]


class TableResult(BaseModel):
    """An aggregate's answer: its group and measure columns; bytes cells are base64."""

    # The published schema lists kind as required, since every answer carries it.
    model_config = ConfigDict(json_schema_serialization_defaults_required=True)

    kind: Literal["table"] = "table"
    columns: list[str]
    rows: _Rows = Field(
        description=(
            "One row per group, with a cell for each column in order; at most "
            f"{execute.DEFAULT_MAX_ROWS:,}"
        ),
    )
    truncated: bool = Field(description=_TRUNCATED)

    @field_serializer("rows", when_used="json")
    def _encode_bytes(self, rows: list[list[Any]]) -> _Rows:
        """Encode bytes cells as standard base64, which JSON has no type for.

        Args:
            rows: The table's rows, as the model holds them.

        Returns:
            The rows with every bytes value, however deeply nested in a cell, replaced
            by its base64 text.
        """
        return [[_base64_bytes(cell) for cell in row] for row in rows]


SearchResult = Annotated[ReactionsResult | TableResult, Field(discriminator="kind")]


class ErrorDetail(BaseModel):
    """The body of an error a route raises itself: a message."""

    detail: str


class ValidationErrorItem(BaseModel):
    """One way a request fails validation, as in FastAPI's own ValidationError."""

    loc: list[str | int] = Field(title="Location")
    msg: str = Field(title="Message")
    type: str = Field(title="Error Type")
    input: Any = Field(default=None, title="Input")
    ctx: dict[str, Any] | None = Field(default=None, title="Context")


class ValidationErrors(BaseModel):
    """The body FastAPI answers 422 with when the request fails validation."""

    detail: list[ValidationErrorItem]
