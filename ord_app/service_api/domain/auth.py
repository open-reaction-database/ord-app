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

from fastapi import Depends
from sqlalchemy import exists, select
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.models import (
    DatasetGroupAssociationModel,
    DatasetModel,
    UserGroupsMembershipModel,
    UserModel,
    UserRolesList,
)
from ord_app.service_api.repositories.users import UserRepository
from ord_app.service_api.services.auth0 import verify_access_token
from ord_app.service_api.services.exceptions import UnauthenticatedError, UnauthorizedError
from ord_app.service_api.services.postgresql import get_db_session


async def authenticate(
    db_session: AsyncSession = Depends(get_db_session),
    token: dict = Depends(verify_access_token)
):
    if user := await UserRepository(db_session).get(auth0_id=token["sub"]):
        return user
    raise UnauthenticatedError(detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})


def group_authorization(allowed_roles: tuple[UserRolesList, ...]):
    async def _authorize(
        group_id: int | None,
        user: UserModel = Depends(authenticate),
        db_session: AsyncSession = Depends(get_db_session),
    ):
        stmt = select(
            exists().where(
                UserGroupsMembershipModel.user_id == user.id,
                UserGroupsMembershipModel.group_id == group_id,
                UserGroupsMembershipModel.role.in_(allowed_roles),
            )
        )
        if not await db_session.scalar(stmt):
            raise UnauthorizedError(detail="Access forbidden", headers={"WWW-Authenticate": "Bearer"})

    return _authorize


def dataset_authorization(allowed_roles: tuple[UserRolesList, ...]):
    async def _authorize(
        dataset_id: int | None,
        user: UserModel = Depends(authenticate),
        db_session: AsyncSession = Depends(get_db_session),
    ):
        stmt = select(
            exists().where(
                DatasetGroupAssociationModel.dataset_id == dataset_id,
                DatasetGroupAssociationModel.dataset_id == DatasetModel.id,
                UserGroupsMembershipModel.group_id == DatasetGroupAssociationModel.group_id,
                UserGroupsMembershipModel.user_id == user.id,
                UserGroupsMembershipModel.role.in_(allowed_roles),
            )
        )
        if not await db_session.scalar(stmt):
            raise UnauthorizedError(detail="Access forbidden", headers={"WWW-Authenticate": "Bearer"})

    return _authorize
