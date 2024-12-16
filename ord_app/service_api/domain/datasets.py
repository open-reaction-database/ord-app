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

from fastapi import UploadFile
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from google.protobuf import json_format, text_format
from google.protobuf.message import Message
from ord_schema.proto.dataset_pb2 import Dataset
from ord_schema.proto.reaction_pb2 import Reaction
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from ord_app.service_api.models import DatasetModel, UserModel
from ord_app.service_api.schemas.datasets import DatasetCreateSchema, DownloadFileFormats


async def get_datasets(db_session: AsyncSession, user: UserModel) -> Sequence[DatasetModel]:
    stmt = select(DatasetModel).where(DatasetModel.owner == user)
    datasets = await db_session.scalars(stmt)
    return datasets.all()


async def paginate_datasets(db_session: AsyncSession, user: UserModel) -> Page[DatasetModel]:
    stmt = select(DatasetModel).where(DatasetModel.owner == user).options(joinedload(DatasetModel.owner))
    return await paginate(db_session, stmt)


async def get_user_dataset(db_session: AsyncSession, user: UserModel, dataset_id: int) -> DatasetModel:
    stmt = select(DatasetModel).where(DatasetModel.owner == user, DatasetModel.id == dataset_id).limit(1)
    dataset = await db_session.scalar(stmt)
    return dataset


async def create_dataset(db_session: AsyncSession, user: UserModel, payload: DatasetCreateSchema) -> DatasetModel:
    dataset = DatasetModel(owner=user, **payload.model_dump(exclude_unset=True))
    db_session.add(dataset)
    await db_session.commit()
    await db_session.refresh(dataset)
    return dataset


async def delete_dataset(db_session: AsyncSession, user: UserModel, dataset_id: int):
    stmt = delete(DatasetModel).where(DatasetModel.owner == user, DatasetModel.id == dataset_id)
    await db_session.execute(stmt)
    await db_session.commit()


async def download_user_dataset(
    db_session: AsyncSession, user: UserModel, dataset_id: int, file_format: DownloadFileFormats
) -> tuple[DatasetModel, bytes]:
    dataset = await get_user_dataset(db_session, user, dataset_id)
    data = write_message(Dataset.FromString(dataset.binpb), kind=file_format)
    return dataset, data


async def upload_user_dataset(db_session: AsyncSession, user: UserModel, file: UploadFile):
    data = await file.read()

    if file.filename.endswith(".gz"):
        data = gzip.decompress(data)

    if ".json" in file.filename:
        kind = "json"
    elif ".binpb" in file.filename:
        kind = "binpb"
    elif ".txtpb" in file.filename:
        kind = "txtpb"
    else:
        raise ValueError(file.filename)

    dataset_proto = load_message(data, Dataset, kind)
    dataset = DatasetModel(user=user, name=dataset_proto.name, binpb=dataset_proto.SerializeToString())
    db_session.add(dataset)
    await db_session.commit()
    await db_session.refresh(dataset)
    return dataset


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
