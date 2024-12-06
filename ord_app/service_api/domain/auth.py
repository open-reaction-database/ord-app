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
import datetime

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.users import get_user_by_email
from ord_app.service_api.services.postgresql import get_db_session
from ord_app.service_api.settings import RuntimeSettings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.UTC) + datetime.timedelta(minutes=RuntimeSettings.JWT_ACCESS_TOKEN_EXPIRE)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, RuntimeSettings.JWT_SECRET_KEY, algorithm=RuntimeSettings.JWT_ALGORITHM)
    return encoded_jwt


async def get_current_user(db_session: AsyncSession = Depends(get_db_session), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, RuntimeSettings.JWT_SECRET_KEY, algorithms=[RuntimeSettings.JWT_ALGORITHM])
        if not (email := payload.get("sub")):
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    if not (user := await get_user_by_email(db_session, email)):
        raise credentials_exception
    return user
