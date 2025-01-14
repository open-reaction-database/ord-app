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
import gzip
from base64 import b64encode
from typing import Sequence, Type

import orjson
from fastapi import UploadFile
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from google.protobuf import json_format, text_format
from google.protobuf.message import Message
from ord_schema.proto.dataset_pb2 import Dataset
from ord_schema.proto.reaction_pb2 import Reaction
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from ord_app.service_api.domain.exceptions import EntityDoesNotExist
from ord_app.service_api.models import (
    DatasetGroupAssociationModel,
    DatasetModel,
    GroupModel,
    ReactionModel,
    UserGroupsMembershipModel,
    UserModel,
)
from ord_app.service_api.schemas.datasets import DatasetCreateSchema, DownloadFileFormats


async def get_datasets(db_session: AsyncSession, user: UserModel) -> Sequence[DatasetModel]:
    stmt = select(DatasetModel).where(DatasetModel.owner == user)
    datasets = await db_session.scalars(stmt)
    return datasets.all()


async def paginate_group_datasets(db_session: AsyncSession, group_id: int) -> Page[DatasetModel]:
    stmt = (
        select(DatasetModel)
        .join(DatasetGroupAssociationModel, DatasetGroupAssociationModel.dataset_id == DatasetModel.id)
        .where(DatasetGroupAssociationModel.group_id == group_id)
        .options(
            joinedload(DatasetModel.owner),
            joinedload(DatasetModel.reactions).load_only(ReactionModel.id),
        )
    )
    return await paginate(db_session, stmt)


async def update_dataset(db_session: AsyncSession, dataset_id: int, payload: DatasetCreateSchema) -> DatasetModel:
    stmt = (
        update(DatasetModel)
        .where(DatasetModel.id == dataset_id)
        .values(payload=payload.model_dump())
        .returning(DatasetModel)
    )
    result = await db_session.scalar(stmt)
    await db_session.commit()
    return result


async def paginate_user_datasets(db_session: AsyncSession, user: UserModel) -> Page[DatasetModel]:
    stmt = (
        select(DatasetModel)
        .distinct()
        .join(DatasetModel.groups)
        .join(GroupModel.members)
        .join(UserGroupsMembershipModel, UserGroupsMembershipModel.group_id == GroupModel.id)
        .where(UserGroupsMembershipModel.user_id == user.id)
        .options(
            joinedload(DatasetModel.owner),
            joinedload(DatasetModel.reactions).load_only(ReactionModel.id),
        )
    )
    return await paginate(db_session, stmt)


async def get_dataset(db_session: AsyncSession, dataset_id: int) -> DatasetModel:
    stmt = select(DatasetModel).where(DatasetModel.id == dataset_id).options(joinedload(DatasetModel.owner)).limit(1)
    dataset = await db_session.scalar(stmt)
    return dataset


async def create_dataset(
    db_session: AsyncSession, group_id: int, user: UserModel, payload: DatasetCreateSchema
) -> DatasetModel:
    dataset = DatasetModel(owner=user, **payload.model_dump(exclude_unset=True))
    db_session.add(dataset)
    await db_session.flush()

    dataset_group_association = DatasetGroupAssociationModel(dataset_id=dataset.id, group_id=group_id)
    db_session.add(dataset_group_association)

    await db_session.commit()
    await db_session.refresh(dataset)
    return dataset


async def delete_dataset(db_session: AsyncSession, dataset_id: int):
    stmt = delete(DatasetModel).where(DatasetModel.id == dataset_id)
    await db_session.execute(stmt)
    await db_session.commit()


async def download_dataset(
    db_session: AsyncSession, dataset_id: int, file_format: DownloadFileFormats
) -> tuple[DatasetModel, bytes]:
    stmt = select(DatasetModel).where(DatasetModel.id == dataset_id).options(joinedload(DatasetModel.reactions))
    dataset = await db_session.scalar(stmt)

    if not dataset:
        raise EntityDoesNotExist("Dataset not found")

    dataset_pb = load_message(
        orjson.dumps({"name": dataset.name, "description": dataset.description}),
        Dataset,
        "json"
    )

    dataset_pb.reactions.extend([Reaction.FromString(reaction.binpb) for reaction in dataset.reactions])

    data = write_message(dataset_pb, kind=file_format)
    return dataset, data


async def upload_user_dataset(db_session: AsyncSession, group_id: int, user: UserModel, file: UploadFile):
    file_data = await file.read()

    if file.filename.endswith(".gz"):
        file_data = gzip.decompress(file_data)

    if ".json" in file.filename:
        kind = "json"
    elif ".binpb" in file.filename:
        kind = "binpb"
    elif ".txtpb" in file.filename:
        kind = "txtpb"
    else:
        raise ValueError(file.filename)

    dataset_pb = load_message(file_data, Dataset, kind)

    dataset = DatasetModel(owner=user, name=dataset_pb.name)
    db_session.add(dataset)
    await db_session.flush()

    dataset_group_association = DatasetGroupAssociationModel(dataset_id=dataset.id, group_id=group_id)
    db_session.add(dataset_group_association)

    reactions = []
    for reaction in dataset_pb.reactions:
        reactions.append(
            ReactionModel(
                name=reaction.reaction_id,
                binpb=reaction.SerializeToString(),
                dataset=dataset,
                owner=user,
            )
        )

    db_session.add_all(reactions)
    await db_session.commit()

    return await get_dataset(db_session, dataset.id)


def write_message(message: Dataset | Reaction, kind: str) -> bytes:
    """Serializes a dataset or reaction.

    Args:
        message: Dataset or Reaction proto.
        kind: Serialization kind.

    Returns:
        Serialized proto.
    """
    match kind:
        case "binpb":
            data = message.SerializeToString()
        case "json":
            data = json_format.MessageToJson(message).encode()
        case "txtpb":
            data = text_format.MessageToBytes(message)
        case _:
            raise ValueError(kind)
    return data


def load_message(data: bytes, message_type: Type[Dataset | Reaction], kind: str) -> Dataset | Reaction:
    """Loads a serialized dataset.

    Args:
        data: Serialized dataset proto.
        message_type: Message type.
        kind: Serialization kind.

    Returns:
        Dataset or Reaction proto.
    """
    match kind:
        case "binpb":
            dataset = message_type.FromString(data)
        case "json":
            dataset = json_format.Parse(data, message_type())
        case "txtpb":
            dataset = text_format.Parse(data.decode(), message_type())
        case _:
            raise ValueError(kind)
    return dataset


def send_message(message: Message) -> str:
    """Converts a protocol buffer message to a base64-encoded string."""
    return b64encode(message.SerializeToString()).decode()
