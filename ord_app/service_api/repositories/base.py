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

from sqlalchemy import BinaryExpression, select
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar("T")

class AbstractRepository(ABC, Generic[T]):
    model: Type[T]

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    @abstractmethod
    async def get(self, **kwargs) -> Optional[T]:
        pass

def _get_filter_stmt(model: Any, **kwargs: Any) -> List[BinaryExpression]:
    filters: List[BinaryExpression] = []
    for field_name, field_value in kwargs.items():
        if field_name not in model.__table__.columns:
            raise AttributeError(f"Field '{model.__name__}.{field_name}' doesn't exist.")
        filters.append(getattr(model, field_name) == field_value)
    return filters

class BaseRepository(AbstractRepository[T]):
    async def get(self, **kwargs) -> Optional[T]:
        stmt = select(self.model).where(*_get_filter_stmt(self.model, **kwargs))
        result = await self.db.scalar(stmt)
        return result

    async def filter(self, **kwargs) -> Sequence[T]:
        stmt = select(self.model).where(*_get_filter_stmt(self.model, **kwargs))
        result = await self.db.scalars(stmt)
        return result.all()
