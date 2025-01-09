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
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.auth import authenticate
from ord_app.service_api.domain.users import get_user_uc
from ord_app.service_api.models import UserModel
from ord_app.service_api.schemas.users import UserSchema
from ord_app.service_api.services.postgresql import get_db_session

router = APIRouter(tags=["users"], prefix="/users")


@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: UserModel = Depends(authenticate)):
    return current_user


@router.get("/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: int,
    db_session: AsyncSession = Depends(get_db_session),
):
    if user := await get_user_uc(db_session, user_id):
        return user
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


# @router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
# async def delete_user(
#     user_id: int,
#     db_session: AsyncSession = Depends(get_db_session),
# ):
#     if await delete_user_uc(db_session, user_id):
#         return "User was deleted", status.HTTP_204_NO_CONTENT
#     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
