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
from typing import Annotated

from fastapi import APIRouter, Depends

from ord_app.service_api.domain.auth import authenticate
from ord_app.service_api.domain.users import UserUseCase, get_user_use_case
from ord_app.service_api.models import UserModel
from ord_app.service_api.schemas.users import UserSchema, UserUpdateSchema

router = APIRouter(tags=["users"], prefix="/users")


@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: UserModel = Depends(authenticate)):
    return current_user


@router.get("/{user_id}", response_model=UserSchema)
async def get_user(user_id: int, use_case: Annotated[UserUseCase, Depends(get_user_use_case)]):
    return await use_case.get(user_id)


@router.patch("/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: int,
    payload: UserUpdateSchema,
    use_case: Annotated[UserUseCase, Depends(get_user_use_case)]
):
    return await use_case.update(user_id, payload)
