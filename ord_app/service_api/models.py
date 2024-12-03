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

from sqlalchemy import String, func, LargeBinary
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class BaseModel(DeclarativeBase):
    pass


class UserModel(BaseModel):
    __tablename__ = 'users'

    user_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    user_name: Mapped[str] = mapped_column(nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())

    @hybrid_property
    def created(self):
        return int(round(self.created_at.timestamp()))


class DatasetModel(BaseModel):
    __tablename__ = 'datasets'

    user_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    dataset_name: Mapped[str] = mapped_column(primary_key=True)

    binpb: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())
    modified_at: Mapped[datetime.datetime] = mapped_column(
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
        nullable=False
    )

    @hybrid_property
    def created(self):
        return int(round(self.created_at.timestamp()))

    @hybrid_property
    def modified(self):
        return int(round(self.modified_at.timestamp()))


    # __table_args__ = (
    #     {'extend_existing': True},
    #     {'primary_key': ['user_id', 'dataset_name']}
    # )
