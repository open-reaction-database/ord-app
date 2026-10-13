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

"""Search in the grammar ord-schema's search compiles."""

from typing import Annotated

from fastapi import APIRouter, Depends

from ord_viewer.schemas import SearchRequest, SearchResult
from ord_viewer.searching import SEARCH_ERRORS, run_search, to_result
from ord_viewer.state import ViewerState, get_state

router = APIRouter(prefix="/api")


@router.post("/search", responses=SEARCH_ERRORS)
def search(
    body: SearchRequest, state: Annotated[ViewerState, Depends(get_state)]
) -> SearchResult:
    """Run one query: reaction IDs for a plain query, a table for an aggregate.

    Args:
        body: The query to run.
        state: The settings, open corpus, and search slots.

    Returns:
        Reaction IDs for a plain query, or a table for an aggregate.

    Raises:
        HTTPException: 422 if the query is invalid, 504 if it times out.
        SlotsBusyError: If every search slot stays busy for the configured wait.
    """
    return to_result(body.query, run_search(state, body.query))
