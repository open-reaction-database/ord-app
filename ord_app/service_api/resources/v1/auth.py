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
from fastapi import APIRouter, status

from ord_app.service_api.domain.auth import jit_provisioning, refresh_auth0_token
from ord_app.service_api.schemas.auth import Auth0RefreshTokenSchema, Auth0Schema

router = APIRouter(prefix="/auth", tags=["Authorization"])


@router.get("/token", status_code=status.HTTP_201_CREATED, response_model=Auth0Schema)
async def get_token(code: str, redirect_uri: str):
    return await jit_provisioning(code, redirect_uri)


@router.post("/token/refresh", response_model=Auth0Schema)
async def refresh_token(payload: Auth0RefreshTokenSchema):
    return await refresh_auth0_token(payload.refresh_token)
