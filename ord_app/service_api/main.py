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


from fastapi import APIRouter, FastAPI

from ord_app.service_api.resources.v1 import auth, datasets, reactions, users, utilities, visualizations

app = FastAPI(root_path="/service_api", swagger_ui_parameters={"tryItOutEnabled": True})

editor = APIRouter(prefix="/api/v1")
editor.include_router(auth.router)
editor.include_router(users.router)
editor.include_router(datasets.router)
editor.include_router(reactions.router)
editor.include_router(utilities.router)
editor.include_router(visualizations.router)

app.include_router(editor)


@app.get("/healthcheck")
async def health_check():
    return True
