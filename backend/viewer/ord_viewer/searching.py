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

"""Running a query, mapping its failures to HTTP statuses, and shaping its result."""

import contextlib
from collections.abc import Generator
from typing import Any

import pyarrow as pa
from fastapi import HTTPException, status
from fastapi.concurrency import run_in_threadpool
from ord_schema.search import execute
from ord_schema.search.query import Query

from ord_viewer.schemas import (
    ErrorDetail,
    ReactionsResult,
    TableResult,
    ValidationErrors,
)
from ord_viewer.state import ViewerState

# The errors every route that runs a search can return, for its published schema.
SEARCH_ERRORS: dict[int | str, dict[str, Any]] = {
    422: {
        "model": ErrorDetail | ValidationErrors,
        "description": (
            "The request fails validation (a list of errors), or the query does not "
            "compile or names an unknown compound (a message)"
        ),
    },
    503: {"model": ErrorDetail, "description": "Every search slot stayed busy"},
    504: {"model": ErrorDetail, "description": "The search ran past its timeout"},
}


@contextlib.contextmanager
def search_errors() -> Generator[None]:
    """Map a query's failures to 422 and its timeout to 504.

    QueryError and an unresolved compound are ValueErrors; PairingError is one too, but
    it means the corpus is inconsistent, so it propagates as a server error.

    Raises:
        HTTPException: 422 for a ValueError, 504 for a TimeoutError.
        execute.PairingError: If the corpus is inconsistent.
    """
    try:
        yield
    except execute.PairingError:
        raise
    except ValueError as error:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT, str(error)
        ) from error
    except TimeoutError as error:
        raise HTTPException(status.HTTP_504_GATEWAY_TIMEOUT, str(error)) from error


async def run_search(state: ViewerState, request: Query) -> pa.Table:
    """Run one query in a search slot, under the service's timeout.

    The request waits for its slot on the event loop, and only the search itself
    takes a worker thread.

    Args:
        state: The settings, open corpus, and search slots.
        request: The query to run.

    Returns:
        The rows the query produces.

    Raises:
        HTTPException: 422 if the query is invalid, 504 if it times out.
        SlotsBusyError: If every search slot stays busy for the configured wait.
        execute.PairingError: If the corpus is inconsistent; a 500.
    """
    async with state.slots.hold():
        with search_errors():
            # A cancelled request still waits for its thread to finish, so the slot
            # stays held for as long as DuckDB works on the search.
            return await run_in_threadpool(
                state.corpus.search,
                request,
                timeout_seconds=state.settings.search_timeout_seconds,
            )


def _json_numbers(column: pa.ChunkedArray) -> pa.ChunkedArray:
    """Cast a decimal column to the JSON number it holds; leave any other as it is.

    DuckDB's sum over integers is a HUGEINT, which Arrow carries as a decimal, and
    pydantic writes a Decimal as a string.

    Args:
        column: One column of a search's table.

    Returns:
        An int64 column for a decimal of scale 0, a float64 column for any other
        decimal, or the column unchanged.
    """
    if not pa.types.is_decimal(column.type):
        return column
    return column.cast(pa.int64() if column.type.scale == 0 else pa.float64())


def to_result(request: Query, table: pa.Table) -> ReactionsResult | TableResult:
    """Shape a search's table as the result the viewer reads.

    Args:
        request: The query that produced the table; an aggregate gives a table.
        table: What Corpus.search returned.

    Returns:
        Reaction IDs for a plain query, or the columns and rows of an aggregate, each
        saying whether the corpus's row bound may have cut it. Rows are built by
        position, so repeated column names stay aligned, and decimal cells become
        integers or floats.
    """
    truncated = (table.schema.metadata or {}).get(execute.TRUNCATED.encode()) == b"true"
    if request.aggregate is None:
        return ReactionsResult(
            reaction_ids=table.column("reaction_id").to_pylist(), truncated=truncated
        )
    return TableResult(
        columns=table.column_names,
        rows=[
            list(row)
            for row in zip(
                *(_json_numbers(column).to_pylist() for column in table.columns),
                strict=False,
            )
        ],
        truncated=truncated,
    )
