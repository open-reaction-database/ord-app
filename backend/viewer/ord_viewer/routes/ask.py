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

"""Questions in English, translated into the search grammar by ord-schema's nl.ask."""

import os
from typing import Annotated, Any

import anthropic
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from ord_schema.search import nl, nl_log
from ord_schema.search.query import Query
from pydantic import BaseModel, ConfigDict, StringConstraints

from ord_viewer.schemas import ErrorDetail, SearchResult
from ord_viewer.searching import SEARCH_ERRORS, search_errors, to_result
from ord_viewer.state import ViewerState, get_state

router = APIRouter(prefix="/api")

# The bound on one model call; an ask's search has the service's search timeout. An ask
# holds a search slot through its model calls, and the SDK's default of ten minutes
# would let one stalled call hold it that long.
_MODEL_TIMEOUT_SECONDS = 30.0

_STATUS_BY_ERROR: dict[type[nl.NLQueryError], int] = {
    nl.ModelUnavailableError: status.HTTP_503_SERVICE_UNAVAILABLE,
    nl.ModelRateLimitedError: status.HTTP_429_TOO_MANY_REQUESTS,
    nl.ModelRefusedError: status.HTTP_422_UNPROCESSABLE_CONTENT,
    nl.UnanswerableError: status.HTTP_422_UNPROCESSABLE_CONTENT,
    nl.MalformedQueryError: status.HTTP_502_BAD_GATEWAY,
}

ASK_ERRORS: dict[int | str, dict[str, Any]] = {
    **SEARCH_ERRORS,
    422: {
        **SEARCH_ERRORS[422],
        "description": (
            "The request fails validation (a list of errors), or the question cannot "
            "be put to the grammar, the model declined it, or its query names an "
            "unknown compound (a message)"
        ),
    },
    429: {
        "model": ErrorDetail,
        "description": "The model is rate limiting the service",
    },
    502: {
        "model": ErrorDetail,
        "description": "The model's query did not compile, and neither did its repair",
    },
    503: {
        "model": ErrorDetail,
        "description": (
            "Every search slot stayed busy, no API key is configured, or the model "
            "could not be reached"
        ),
    },
}


class AskRequest(BaseModel):
    """A question in English."""

    model_config = ConfigDict(extra="forbid")

    question: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=2000)
    ]


class AskResponse(BaseModel):
    """The query a question became, a sentence about what it found, and the result."""

    query: Query
    text: str
    result: SearchResult


def ask_client_from_environment() -> anthropic.Anthropic | None:
    """Return a client when ord-schema's key variable or the SDK's is set, else None.

    Returns:
        ord-schema's client, each call bounded by _MODEL_TIMEOUT_SECONDS, or None.
    """
    if os.environ.get(nl.API_KEY_VARIABLE) or os.environ.get("ANTHROPIC_API_KEY"):
        return nl.get_client().with_options(timeout=_MODEL_TIMEOUT_SECONDS)
    return None


async def get_ask_client(  # NOSONAR
    state: Annotated[ViewerState, Depends(get_state)],
) -> anthropic.Anthropic:
    """Return the model client, or answer 503 when no key is configured.

    It is async so FastAPI resolves it on the event loop rather than in a worker thread.

    Args:
        state: The settings, open corpus, search slots, and model client.

    Returns:
        The client /api/ask sends questions through.

    Raises:
        HTTPException: 503, if no API key is configured.
    """
    if state.ask_client is None:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE, "no Anthropic API key is configured"
        )
    return state.ask_client


@router.post("/ask", responses=ASK_ERRORS)
async def ask(
    body: AskRequest,
    state: Annotated[ViewerState, Depends(get_state)],
    client: Annotated[anthropic.Anthropic, Depends(get_ask_client)],
) -> AskResponse:
    """Translate a question into a query, run it, and describe what it found.

    It is async so a question waits for its search slot on the event loop; the model
    calls, the search, and the shaping of its result run in worker threads.

    Args:
        body: The question.
        state: The settings, open corpus, and search slots.
        client: The model client.

    Returns:
        The query the question became, a sentence about what it found, and the result.

    Raises:
        HTTPException: 422 if the question cannot be put to the grammar, the model
            declined it, or its query names an unknown compound; 429 if the model is
            rate limiting; 502 if the model's query never compiles; 503 if the model
            cannot be reached; 504 if the search times out.
        SlotsBusyError: If every search slot stays busy for the configured wait.
        execute.PairingError: If the corpus is inconsistent; a 500.
    """
    sink = nl_log.StdoutSink() if state.settings.ask_log == "stdout" else None
    async with state.slots.hold():
        with search_errors():
            try:
                answer = await run_in_threadpool(
                    nl.ask,
                    body.question,
                    state.corpus,
                    client=client,
                    model=state.settings.ask_model,
                    timeout_seconds=state.settings.search_timeout_seconds,
                    sink=sink,
                    source="ord-viewer",
                )
            except nl.NLQueryError as error:
                code = _STATUS_BY_ERROR.get(type(error), status.HTTP_502_BAD_GATEWAY)
                raise HTTPException(code, str(error)) from error
    result = await run_in_threadpool(to_result, answer.query, answer.table)
    return AskResponse(query=answer.query, text=answer.text, result=result)
