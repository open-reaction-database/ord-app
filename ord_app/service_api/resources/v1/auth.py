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
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.auth import create_access_token
from ord_app.service_api.domain.users import authenticate_user
from ord_app.service_api.services.postgresql import get_db_session

router = APIRouter(prefix="/auth", tags=["Authorization"])


@router.post("/token", status_code=status.HTTP_201_CREATED)
async def get_token(
    db_session: AsyncSession = Depends(get_db_session), form_data: OAuth2PasswordRequestForm = Depends()
):
    if user := await authenticate_user(db_session, form_data.username, form_data.password):
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )
