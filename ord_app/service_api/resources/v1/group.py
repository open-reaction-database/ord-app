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

from ord_app.service_api.domain.auth import authenticate
from ord_app.service_api.domain.groups import create_group, delete_group, get_group, list_groups, update_group
from ord_app.service_api.models import UserModel
from ord_app.service_api.schemas.groups import GroupCreateSchema, GroupSchema
from ord_app.service_api.services.postgresql import get_db_session

router = APIRouter(tags=["group"])


@router.post("/groups", response_model=GroupSchema, status_code=status.HTTP_201_CREATED)
async def _create_group(
    payload: GroupCreateSchema,
    user: UserModel = Depends(authenticate),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await create_group(db_session, user, payload)


@router.get("/groups", response_model=list[GroupSchema])
async def _list_groups(
    user: UserModel = Depends(authenticate),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await list_groups(db_session, user)


@router.get("/groups/{group_id}", response_model=GroupSchema)
async def _get_group(
    group_id: int,
    user: UserModel = Depends(authenticate),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await get_group(db_session, user, group_id)


@router.patch("/groups/{group_id}", status_code=status.HTTP_201_CREATED, response_model=GroupSchema)
async def _update_group(
    group_id: int,
    payload: GroupCreateSchema,
    user: UserModel = Depends(authenticate),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await update_group(db_session, user, group_id, payload)


@router.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def _delete_group(
    group_id: int,
    user: UserModel = Depends(authenticate),
    db_session: AsyncSession = Depends(get_db_session),
):
    await delete_group(db_session, user, group_id)
