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

"""Open Reaction Database API."""

import os
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from testing.postgresql import Postgresql

from ord_app.api.editor import datasets, reactions, users, utilities, visualizations
from ord_app.api.testing import setup_test_postgres


@asynccontextmanager
async def lifespan(*args, **kwargs):
    """FastAPI lifespan setup; see https://fastapi.tiangolo.com/advanced/events/#lifespan."""
    del args, kwargs  # Unused.
    if os.getenv("ORD_APP_TESTING", "FALSE") == "TRUE":
        with Postgresql() as postgres:
            setup_test_postgres(postgres.url())
            os.environ["ORD_APP_POSTGRES"] = postgres.url()
            yield
    else:
        yield


app = FastAPI(lifespan=lifespan, root_path="/api")

editor = APIRouter(prefix="/editor")
editor.include_router(datasets.router)
editor.include_router(reactions.router)
editor.include_router(users.router)
editor.include_router(utilities.router)
editor.include_router(visualizations.router)

app.include_router(editor)


@app.get("/healthcheck")
async def health_check():
    return True
