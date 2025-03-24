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
from abc import ABC, abstractmethod
from typing import Any, Generic, List, Optional, Sequence, Type, TypeVar

from loguru import logger
from sqlalchemy import BinaryExpression, delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.models import UserModel

T = TypeVar("T")


filters_map = {
    list: lambda field, values: field.in_(values),
    tuple: lambda field, values: field.in_(values),
}


class AbstractRepository(ABC, Generic[T]):
    model: Type[T]

    def __init__(self, db: AsyncSession, current_user: UserModel | None = None) -> None:
        self.db = db
        self.current_user = current_user

    @abstractmethod
    async def get(self, **kwargs) -> Optional[T]:
        pass

class BaseRepository(AbstractRepository[T]):
    @staticmethod
    def _get_filter_stmt(model: Any, **kwargs: Any) -> List[BinaryExpression]:
        filters: List[BinaryExpression] = []
        for field_name, field_value in kwargs.items():
            if field_name not in model.__table__.columns:
                raise AttributeError(f"Field '{model.__name__}.{field_name}' doesn't exist.")

            attr = getattr(model, field_name)
            ft = filters_map.get(
                type(field_value),
                lambda field, value: field == value
            )(attr, field_value)

            filters.append(
                ft
            )
        return filters

    async def create(self, payload: dict) -> T:
        instance = self.model(**payload)
        self.db.add(instance)
        await self.db.commit()
        await self.db.refresh(instance)
        return instance

    async def get(self, **kwargs) -> Optional[T]:
        stmt = select(self.model).where(*self._get_filter_stmt(self.model, **kwargs))
        result = await self.db.scalar(stmt)
        return result

    async def filter(self, **kwargs) -> Sequence[T]:
        stmt = select(self.model).where(*self._get_filter_stmt(self.model, **kwargs))
        result = await self.db.scalars(stmt)
        return result.all()

    async def update(self, payload: dict, autocommit: bool = True, **kwargs) -> Optional[T] | None:
        stmt = (
            update(self.model)
            .where(*self._get_filter_stmt(self.model, **kwargs))
            .values(**payload)
            .returning(self.model)
        )

        if autocommit:
            obj = await self.db.scalar(stmt)
            await self.db.commit()
            logger.debug(f"{self.model.__name__} updated with payload: {payload}")
            return obj

    async def delete(self, **kwargs) -> int:
        stmt = delete(self.model).where(*self._get_filter_stmt(self.model, **kwargs))
        result = await self.db.execute(stmt)
        await self.db.commit()
        logger.debug(f"<{self.model.__name__.title()}({kwargs})> was deleted")
        return result.rowcount
