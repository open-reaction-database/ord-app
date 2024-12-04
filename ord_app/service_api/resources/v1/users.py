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
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.users import get_user_uc, create_user_uc
from ord_app.service_api.schemas.users import ResponseUserSchema, CreateUserSchema
from ord_app.service_api.services.postgresql import get_db_session

router = APIRouter(tags=["users"], prefix="/users")


@router.post("/",
    response_model=ResponseUserSchema,
    status_code=status.HTTP_201_CREATED
)
async def create_user(
    payload: CreateUserSchema,
    db_session: AsyncSession = Depends(get_db_session),
):
    return await create_user_uc(db_session, payload)


@router.get("/{user_id}", response_model=ResponseUserSchema)
async def get_user(
    user_id: int,
    db_session: AsyncSession = Depends(get_db_session),
):
    if user := await get_user_uc(db_session, user_id):
        return user
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db_session: AsyncSession = Depends(get_db_session),
):
    if await delete_user(db_session, user_id):
        return "User was deleted", status.HTTP_204_NO_CONTENT
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")