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
from ord_schema.search import nl, nl_log, placeholders
from ord_schema.search.query import Query
from pydantic import BaseModel, ConfigDict, Field, StringConstraints, ValidationError

from ord_viewer.schemas import ErrorDetail, SearchResult
from ord_viewer.searching import SEARCH_ERRORS, search_errors, to_result
from ord_viewer.state import ViewerState, get_state

router = APIRouter(prefix="/api")

# An ask holds a search slot through up to three model calls (its query, a repair when
# the query does not compile, and the sentence about what the search found) and the
# search, which has the service's search timeout. Each call makes one attempt, which
# gives up after 30 s waiting on the API; the SDK's defaults would wait ten minutes and
# retry twice, each time after waiting out any Retry-After the API sends. A failed call
# ends the ask with 429 or 503, and the caller can ask again without holding a slot
# meanwhile.
_MODEL_TIMEOUT_SECONDS = 30.0
_MODEL_MAX_RETRIES = 0

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
            "Every search slot stayed busy, no API key is configured, or a call to "
            "the model failed"
        ),
    },
}


# A placeholder's name as a question writes it, such as @A, and the structure it names.
_PlaceholderName = Annotated[str, StringConstraints(pattern=placeholders.NAME_PATTERN)]
_Structure = Annotated[
    str, StringConstraints(min_length=1, max_length=placeholders.MOST_CHARACTERS)
]


class AskRequest(BaseModel):
    """A question in English, with any structures it names by placeholder."""

    model_config = ConfigDict(extra="forbid")

    question: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=2000)
    ]
    # Each placeholder the question writes, mapped to the SMILES, SMARTS, or reaction
    # SMARTS it stands for; the model is told each one's format and never its text.
    structures: Annotated[
        dict[_PlaceholderName, _Structure],
        Field(max_length=placeholders.MOST_PLACEHOLDERS),
    ] = Field(default_factory=dict)


class AskResponse(BaseModel):
    """The query a question became, a sentence about what it found, and the result."""

    query: Query
    text: str
    result: SearchResult


def ask_client_from_environment() -> anthropic.Anthropic | None:
    """Return a client when ord-schema's key variable or the SDK's is set, else None.

    Returns:
        ord-schema's client, making one attempt per call with a timeout of
        _MODEL_TIMEOUT_SECONDS, or None.
    """
    if os.environ.get(nl.API_KEY_VARIABLE) or os.environ.get("ANTHROPIC_API_KEY"):
        return nl.get_client().with_options(
            timeout=_MODEL_TIMEOUT_SECONDS, max_retries=_MODEL_MAX_RETRIES
        )
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


def _placeholders(body: AskRequest) -> dict[str, placeholders.Placeholder]:
    """Read each structure a question names, and check the question writes each name.

    Args:
        body: The question and its structures.

    Returns:
        Each placeholder's name, mapped to its structure in the format its text is in.

    Raises:
        HTTPException: 422, naming the placeholder, if a structure is not a SMILES,
            SMARTS, or reaction SMARTS the grammar takes, or if the question writes a
            name with no structure or a structure's name is not in the question.
    """
    structures = {}
    for name, text in body.structures.items():
        try:
            structures[name] = placeholders.classify(text)
        except ValidationError as error:
            reasons = "; ".join(
                str(detail["msg"]).removeprefix("Value error, ")
                for detail in error.errors()
            )
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT, f"{name}: {reasons}"
            ) from error
        except ValueError as error:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT, f"{name}: {error}"
            ) from error
    try:
        placeholders.check(body.question, structures)
    except placeholders.PlaceholderError as error:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT, str(error)
        ) from error
    return structures


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
        body: The question, with any structures it names by placeholder.
        state: The settings, open corpus, and search slots.
        client: The model client.

    Returns:
        The query the question became, a sentence about what it found, and the result.

    Raises:
        HTTPException: 422 if a structure does not fit the question or the grammar,
            the question cannot be put to the grammar, the model declined it, or its
            query names an unknown compound; 429 if the model is
            rate limiting; 502 if the model's query never compiles; 503 if a call to
            the model fails for any other reason; 504 if the search times out.
        SlotsBusyError: If every search slot stays busy for the configured wait.
        execute.PairingError: If the corpus is inconsistent; a 500.
    """
    # Checked before the question waits for a slot, which a structure that does not fit
    # would hold for nothing.
    structures = _placeholders(body)
    sink = nl_log.StdoutSink() if state.settings.ask_log == "stdout" else None
    async with state.slots.hold():
        with search_errors():
            try:
                answer = await run_in_threadpool(
                    nl.ask,
                    body.question,
                    state.corpus,
                    structures=structures,
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
