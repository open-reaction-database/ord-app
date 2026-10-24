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

"""The viewer's FastAPI app: one corpus, opened at startup and held until shutdown."""

import contextlib
from collections.abc import AsyncGenerator, Callable
from typing import cast

import anthropic
from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from ord_viewer.corpus import newest_arrival, open_corpus
from ord_viewer.routes import ask, datasets, download, health, reactions, search
from ord_viewer.settings import Settings
from ord_viewer.slots import SearchSlots, SlotsBusyError
from ord_viewer.state import ViewerState


async def _slots_busy(request: Request, error: Exception) -> JSONResponse:  # NOSONAR
    """Answer 503 when every search slot stayed busy.

    It is async so Starlette runs it on the event loop, and the 503 needs no worker
    thread however busy the threadpool is.

    Args:
        request: The request that waited for a slot.
        error: The SlotsBusyError that ended the wait.

    Returns:
        A 503 response carrying the error's message.
    """
    return JSONResponse(status_code=503, content={"detail": str(error)})


async def _request_invalid(  # NOSONAR
    request: Request, error: Exception
) -> JSONResponse:
    """Answer 422 with FastAPI's usual body, less the input each error echoes.

    Pydantic echoes the value that failed as each error's input, however deeply it
    nests, and a value nested past the recursion limit (a deep query, or a deep value
    under an unknown key) is deeper than jsonable_encoder can recurse. The caller sent
    that value, so the error's type, location, and message identify it. It is async, as
    FastAPI's own handler is, so Starlette runs it on the event loop rather than in a
    worker thread.

    Args:
        request: The request that failed validation.
        error: The RequestValidationError listing what pydantic found.

    Returns:
        A 422 response listing the errors.
    """
    errors = [
        {key: value for key, value in item.items() if key != "input"}
        for item in cast(RequestValidationError, error).errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={"detail": jsonable_encoder(errors)},
    )


def create_app(
    settings_factory: Callable[[], Settings] = Settings,
    *,
    resolver: Callable[[str], str] | None = None,
    ask_client_factory: Callable[
        [], anthropic.Anthropic | None
    ] = ask.ask_client_from_environment,
) -> FastAPI:
    """Build the app; its lifespan reads the settings and opens the corpus.

    Uvicorn accepts no connection until the lifespan has opened the corpus, and exits
    non-zero if opening it raises.

    Args:
        settings_factory: Called once at startup; the default reads the environment.
        resolver: Resolves compound names in queries to SMILES; None uses ord-schema's
            resolvers.
        ask_client_factory: Called once at startup for /api/ask's model client; None
            leaves /api/ask answering 503. The default reads the API key variables.

    Returns:
        The app, with every route registered.
    """

    @contextlib.asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
        settings = settings_factory()
        with contextlib.ExitStack() as stack:
            corpus = stack.enter_context(
                contextlib.closing(open_corpus(settings, resolver=resolver))
            )
            ask_client = ask_client_factory()
            if ask_client is not None:
                stack.callback(ask_client.close)
            app.state.viewer = ViewerState(
                settings=settings,
                corpus=corpus,
                slots=SearchSlots(settings.max_concurrent, settings.slot_wait_seconds),
                newest_arrival=newest_arrival(corpus),
                ask_client=ask_client,
            )
            yield

    app = FastAPI(
        title="Open Reaction Database viewer",
        lifespan=lifespan,
        openapi_url="/api/openapi.json",
        docs_url="/api/docs",
        redoc_url=None,
    )
    app.include_router(health.router)
    app.include_router(datasets.router)
    app.include_router(reactions.router)
    app.include_router(download.router)
    app.include_router(search.router)
    app.include_router(ask.router)
    app.add_exception_handler(SlotsBusyError, _slots_busy)
    app.add_exception_handler(RequestValidationError, _request_invalid)
    return app


app = create_app()
