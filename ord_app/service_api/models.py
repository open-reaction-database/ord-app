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
from typing import Literal, get_args

from sqlalchemy import Enum, ForeignKey, Index, LargeBinary, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column, relationship

UserRolesList = Literal["admin", "editor", "viewer"]


class BaseModel(DeclarativeBase):
    created_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())
    modified_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    @declared_attr
    def __tablename__(cls):
        return re.sub(r"(?<!^)(?=[A-Z])", "_", cls.__name__.removesuffix("Model")).lower()


class UserModel(BaseModel):
    id: Mapped[int] = mapped_column(primary_key=True)
    external_id: Mapped[str] = mapped_column(nullable=True, index=True)
    auth0_id: Mapped[str] = mapped_column(unique=True, nullable=False)
    orcid_id: Mapped[str] = mapped_column(nullable=True, unique=True)
    email: Mapped[str] = mapped_column(unique=True, nullable=True)
    name: Mapped[str] = mapped_column(nullable=True)
    avatar_url: Mapped[str] = mapped_column(nullable=True)

    groups: Mapped[list["GroupModel"]] = relationship(
        secondary="user_groups_membership",
        back_populates="members",
        overlaps="groups_member",
    )

    templates: Mapped["TemplateModel"] = relationship("TemplateModel", back_populates="owner")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class GroupModel(BaseModel):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="SET NULL"), nullable=True)
    owner: Mapped[UserModel] = relationship(UserModel, backref="owner_groups")

    datasets: Mapped[list["DatasetModel"]] = relationship(
        secondary="dataset_group_association",
        back_populates="groups",
        overlaps="dataset_group_associations",
    )

    members: Mapped[list[UserModel]] = relationship(
        secondary="user_groups_membership",
        back_populates="groups",
        overlaps="groups_member",
    )

    def __repr__(self):
        return f"<Group(id={self.id}, name={self.name})>"


class UserGroupsMembershipModel(BaseModel):
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), primary_key=True)
    user: Mapped[UserModel] = relationship(
        UserModel, backref="groups_member", overlaps="groups,members"
    )

    group_id: Mapped[int] = mapped_column(ForeignKey("group.id", ondelete="CASCADE"), primary_key=True)
    group: Mapped[GroupModel] = relationship(
        GroupModel, backref="groups_member", overlaps="groups,members"
    )

    role: Mapped[UserRolesList] = mapped_column(
        Enum(
            *get_args(UserRolesList),
            name="user_group_role_enum",
            create_constraint=True,
            validate_strings=True,
        )
    )

    def __repr__(self):
        return f"<UserGroup(user_id={self.user_id}, group_id={self.group_id}, role={self.role})>"


class DatasetModel(BaseModel):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=True)
    description: Mapped[str] = mapped_column(nullable=True)

    owner_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="SET NULL"))
    owner: Mapped[UserModel] = relationship(UserModel, backref="datasets")

    reactions: Mapped[list["ReactionModel"]] = relationship("ReactionModel", back_populates="dataset")

    groups: Mapped[list[GroupModel]] = relationship(
        secondary="dataset_group_association",
        back_populates="datasets",
        overlaps="dataset_group_associations",
    )

    __table_args__ = (
        Index('ix_dataset_owner_id', 'owner_id', postgresql_using='hash'),
    )

    def __repr__(self):
        return f"<Dataset(id={self.id}, name={self.name}, user_id={self.owner_id})>"


class DatasetGroupAssociationModel(BaseModel):
    dataset_id: Mapped[int] = mapped_column(ForeignKey("dataset.id", ondelete="CASCADE"), primary_key=True)
    dataset: Mapped[DatasetModel] = relationship(
        DatasetModel,
        backref="dataset_group_associations",
        overlaps="groups,datasets",
    )

    group_id: Mapped[int] = mapped_column(ForeignKey("group.id", ondelete="CASCADE"), primary_key=True)
    group: Mapped[GroupModel] = relationship(
        GroupModel,
        backref="dataset_group_associations",
        overlaps="groups,datasets",
    )

    # This flag indicates that this is the main group and that related dataset can be shared with another group.
    is_primary: Mapped[bool] = mapped_column(default=True)

    def __repr__(self):
        return (
            "<DatasetGroupAssociation("
            f"dataset_id={self.dataset_id}, group_id={self.group_id}, is_primary={self.is_primary}"
            ")>"
        )

class ReactionModel(BaseModel):
    id: Mapped[int] = mapped_column(primary_key=True)
    pb_reaction_id: Mapped[str]
    binpb: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    is_valid: Mapped[bool] = mapped_column(nullable=True)

    dataset_id: Mapped[int] = mapped_column(ForeignKey("dataset.id", ondelete="CASCADE"))
    dataset: Mapped[DatasetModel] = relationship(DatasetModel, back_populates="reactions")

    owner_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="SET NULL"))
    owner: Mapped[UserModel] = relationship(UserModel, backref="reactions")

    __table_args__ = (
        UniqueConstraint("pb_reaction_id", "dataset_id", name="uq_pb_reaction_id_dataset_id"),
        Index('ix_reaction_pb_reaction_id', 'pb_reaction_id', postgresql_using='hash'),
        Index('ix_reaction_dataset_id', 'dataset_id', postgresql_using='hash'),
        Index('ix_reaction_owner_id', 'owner_id', postgresql_using='hash'),
    )

    def __repr__(self):
        return f"<Reaction(id={self.id}, dataset_id={self.dataset_id}, name={self.pb_reaction_id})>"


class TemplateModel(BaseModel):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    binpb: Mapped[bytes] = mapped_column(LargeBinary)
    variables: Mapped[JSONB] = mapped_column(JSONB)

    owner_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    owner: Mapped[UserModel] = relationship(UserModel, back_populates="templates")

    __table_args__ = (
        Index('ix_template_owner_id', 'owner_id', postgresql_using='hash'),
    )

    def __repr__(self):
        return f"<Template(id={self.id}, name={self.name})>"
