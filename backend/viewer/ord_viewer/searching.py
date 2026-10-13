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

"""Running a query against the corpus, with its failures mapped to HTTP statuses."""

import contextlib
from collections.abc import Generator

import pyarrow as pa
from fastapi import HTTPException, status
from ord_schema.search import execute
from ord_schema.search.query import Query

from ord_viewer.state import ViewerState


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


def run_search(state: ViewerState, request: Query) -> pa.Table:
    """Run one query in a search slot, under the service's timeout.

    Args:
        state: The settings, open corpus, and search slots.
        request: The query to run.

    Returns:
        The rows the query produces.

    Raises:
        HTTPException: 422 if the query is invalid, 504 if it times out.
        SlotsBusyError: If every search slot stays busy for the configured wait.
    """
    with state.slots.hold(), search_errors():
        return state.corpus.search(
            request, timeout_seconds=state.settings.search_timeout_seconds
        )
