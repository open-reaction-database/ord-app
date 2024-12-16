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
import re

from sqlalchemy import ForeignKey, LargeBinary, func
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column, relationship
from sqlalchemy_utils import EmailType, PasswordType


class BaseModel(DeclarativeBase):
    id: Mapped[int] = mapped_column(primary_key=True)

    created_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())
    modified_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    @declared_attr
    def __tablename__(cls):
        return re.sub(r"(?<!^)(?=[A-Z])", "_", cls.__name__.removesuffix("Model")).lower()


class UserModel(BaseModel):
    email: Mapped[str] = mapped_column(EmailType(), unique=True)
    first_name: Mapped[str] = mapped_column(nullable=True)
    last_name: Mapped[str] = mapped_column(nullable=True)
    password: Mapped[str] = mapped_column(
        PasswordType(schemes=["pbkdf2_sha512", "md5_crypt"], deprecated=["md5_crypt"])
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class DatasetModel(BaseModel):
    name: Mapped[str] = mapped_column(nullable=True)
    description: Mapped[str] = mapped_column(nullable=True)

    owner_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="SET NULL"))
    owner: Mapped[UserModel] = relationship(UserModel, backref="datasets")

    reactions: Mapped[list["ReactionModel"]] = relationship("ReactionModel", back_populates="dataset")

    def __repr__(self):
        return f"<Dataset(id={self.id}, name={self.name}, user_id={self.owner_id})>"


class ReactionModel(BaseModel):
    name: Mapped[str] = mapped_column(nullable=True)
    binpb: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)

    dataset_id: Mapped[int] = mapped_column(ForeignKey("dataset.id", ondelete="CASCADE"))
    dataset: Mapped[DatasetModel] = relationship(DatasetModel, back_populates="reactions")

    owner_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="SET NULL"))
    owner: Mapped[UserModel] = relationship(UserModel, backref="reactions")

    def __repr__(self):
        return f"<Reaction(id={self.id}, name={self.name}, user_id={self.owner_id})>"
