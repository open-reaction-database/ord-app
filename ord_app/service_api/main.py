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
import sys

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_pagination import add_pagination
from loguru import logger

from ord_app.service_api.constants import AppEnvs
from ord_app.service_api.resources.v1 import auth, datasets, group, reactions, users, utilities
from ord_app.service_api.settings import RuntimeSettings

logger.remove()
match RuntimeSettings.app_env:
    case AppEnvs.production:
        logger.add(sys.stdout, level="INFO")
    case AppEnvs.localhost:
        logger.add(sys.stdout, level="DEBUG")
    case _:
        logger.add(sys.stdout, level="INFO")

app = FastAPI(root_path="/service_api", swagger_ui_parameters={"tryItOutEnabled": True})

app.add_middleware(
    CORSMiddleware,
    allow_origins=RuntimeSettings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

editor = APIRouter(prefix="/api/v1")
editor.include_router(auth.router)
editor.include_router(users.router)
editor.include_router(datasets.router)
editor.include_router(reactions.router)
editor.include_router(group.router)
editor.include_router(utilities.router)

app.include_router(editor)

add_pagination(app)


@app.get("/healthcheck")
async def health_check():
    return True
