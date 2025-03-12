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

from typing import Sequence

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.auth import authenticate
from ord_app.service_api.models import TemplateModel, UserModel
from ord_app.service_api.repositories.templates import TemplateRepository
from ord_app.service_api.schemas.templates import TemplateCreateModel, TemplateUpdateModel
from ord_app.service_api.services.exceptions import EntityNotFoundError
from ord_app.service_api.services.postgresql import get_db_session


class TemplatesUseCase:
    def __init__(self, db: AsyncSession, current_user: UserModel):
        self.db = db
        self.current_user = current_user
        self.template_repo = TemplateRepository(db)

    async def create(self, payload: TemplateCreateModel) -> TemplateModel:
        payload = payload.model_dump() | {"owner_id": self.current_user.id}
        return await self.template_repo.create(payload)

    async def all(self) -> Sequence[TemplateModel]:
        return await self.template_repo.filter(owner_id=self.current_user.id)

    async def get(self, template_id: int) -> TemplateModel:
        if template := await self.template_repo.get(id=template_id, owner_id=self.current_user.id):
            return template
        raise EntityNotFoundError("Template not found")

    async def update(self, template_id: int, payload: TemplateUpdateModel):
        payload = payload.model_dump(exclude_none=True)
        if template := await self.template_repo.update(payload, id=template_id, owner_id=self.current_user.id):
            return template
        raise EntityNotFoundError("Template not found")

    async def delete(self, template_id: int):
        if count := await self.template_repo.delete(id=template_id, owner_id=self.current_user.id):
            return count
        raise EntityNotFoundError("Template not found")


def get_templates_use_case(
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(authenticate),
) -> TemplatesUseCase:
    """
    A factory function that retrieves `db` and `current_user` via Depends,
    and then returns a fully initialized UseCase without any mention of Depends inside the UseCase itself.
    """
    return TemplatesUseCase(db=db, current_user=current_user)
