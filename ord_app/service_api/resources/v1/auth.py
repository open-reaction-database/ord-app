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
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.users import jit_provisioning
from ord_app.service_api.schemas.auth import Auth0CreateSchema
from ord_app.service_api.schemas.users import UserSchema
from ord_app.service_api.services.postgresql import get_db_session

router = APIRouter(prefix="/auth", tags=["Authorization"])


@router.post("/jit-provisioning", status_code=status.HTTP_201_CREATED, response_model=UserSchema)
async def _jit_provisioning(
    payload: Auth0CreateSchema,
    db_session: AsyncSession = Depends(get_db_session),
):
    return await jit_provisioning(db_session, payload)
