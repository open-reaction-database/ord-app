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

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from ord_viewer.corpus import open_corpus, resolve_compound_name
from ord_viewer.routes import datasets, download, health, reactions
from ord_viewer.settings import Settings
from ord_viewer.slots import SearchSlots, SlotsBusyError
from ord_viewer.state import ViewerState


async def _slots_busy(request: Request, error: Exception) -> JSONResponse:  # NOSONAR
    """Answer 503 when every search slot stayed busy.

    Args:
        request: The request that waited for a slot.
        error: The SlotsBusyError that ended the wait.

    Returns:
        A 503 response carrying the error's message.
    """
    return JSONResponse(status_code=503, content={"detail": str(error)})


def create_app(
    settings_factory: Callable[[], Settings] = Settings,
    *,
    resolver: Callable[[str], str] = resolve_compound_name,
) -> FastAPI:
    """Build the app; its lifespan reads the settings and opens the corpus.

    Uvicorn accepts no connection until the lifespan has opened the corpus, and exits
    non-zero if opening it raises.

    Args:
        settings_factory: Called once at startup; the default reads the environment.
        resolver: Resolves compound names in queries to SMILES.

    Returns:
        The app, with every route registered.
    """

    @contextlib.asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
        settings = settings_factory()
        with contextlib.closing(open_corpus(settings, resolver=resolver)) as corpus:
            app.state.viewer = ViewerState(
                settings=settings,
                corpus=corpus,
                slots=SearchSlots(settings.max_concurrent, settings.slot_wait_seconds),
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
    app.add_exception_handler(SlotsBusyError, _slots_busy)
    return app


app = create_app()
