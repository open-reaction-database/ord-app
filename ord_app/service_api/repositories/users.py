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
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.models import UserModel


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def search_user_by_identity(self, identity: int | str) -> UserModel:
        stmt = select(UserModel).limit(1)

        if isinstance(identity, int):
            stmt = stmt.where(UserModel.id == identity)
        else:
            stmt = stmt.where(
                or_(
                    UserModel.email == identity,
                    UserModel.external_id.ilike(f"%{identity}%"),
                )
            )

        return await self.db.scalar(stmt)
