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
from google.protobuf import json_format, text_format
from google.protobuf.message import Message
from ord_schema.proto.dataset_pb2 import Dataset
from ord_schema.proto.reaction_pb2 import Reaction
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.models import DatasetModel
from ord_app.service_api.schemas.datasets import DatasetCreateSchema, DownloadFileFormats


async def get_user_datasets(db_session: AsyncSession, user_id: int) -> Sequence[DatasetModel]:
    stmt = select(DatasetModel).where(DatasetModel.user_id == user_id)
    datasets = await db_session.scalars(stmt)
    return datasets.all()


async def get_user_dataset(db_session: AsyncSession, user_id: int, dataset_id: int) -> DatasetModel:
    stmt = select(DatasetModel).where(DatasetModel.user_id == user_id, DatasetModel.id == dataset_id).limit(1)
    dataset = await db_session.scalar(stmt)
    return dataset


async def create_dataset_uc(db_session: AsyncSession, payload: DatasetCreateSchema, user_id: int) -> DatasetModel:
    dataset_proto = Dataset(name=payload.name)
    dataset = DatasetModel(user_id=user_id, name=payload.name, binpb=dataset_proto.SerializeToString())
    db_session.add(dataset)
    await db_session.commit()
    await db_session.refresh(dataset)
    return dataset


async def delete_user_dataset(db_session: AsyncSession, user_id: int, dataset_id: int):
    await db_session.execute(delete(DatasetModel).where(user_id=user_id, id=dataset_id))


async def download_user_dataset(
    db_session: AsyncSession,
    user_id: int,
    dataset_id: int,
    file_format: DownloadFileFormats
) -> tuple[DatasetModel, bytes]:
    dataset = await get_user_dataset(db_session, user_id, dataset_id)
    data = write_message(Dataset.FromString(dataset.binpb), kind=file_format)
    return dataset, data


async def upload_user_dataset(db_session: AsyncSession, user_id: int, file: UploadFile):
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
    dataset = DatasetModel(
        user_id=user_id,
        name=dataset_proto.name,
        binpb=dataset_proto.SerializeToString()
    )
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
