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

"""User API endpoints."""

from uuid import uuid4

from fastapi import APIRouter, Response, Depends
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.services.postgresql import db_session
from ord_app.service_api.database import add_user, get_cursor, remove_user
from ord_app.service_api.models import UserModel

router = APIRouter(tags=["users"])


@router.post("/create_user")
async def create_user(user_name: str, db_session: AsyncSession = Depends(db_session)):
    """Creates a new user and returns the associated user ID."""
    user_id = uuid4().hex
    user = UserModel(user_id=user_id, user_name=user_name)
    db_session.add(user)
    await db_session.commit()
    # with get_cursor() as cursor:
    #     add_user(user_id, user_name, cursor)
    return user_id


@router.get("/delete_user")
async def delete_user(user_id: str, db_session: AsyncSession = Depends(db_session)):
    """Deletes a user."""
    stmt = delete(UserModel).where(user_id=user_id)
    await db_session.execute(stmt)
    # with get_cursor() as cursor:
    #     try:
    #         remove_user(user_id, cursor)
    #     except ValueError as error:
    #         return Response(str(error), status_code=400)
