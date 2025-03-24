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
from base64 import b64encode
from typing import Type
from uuid import uuid4

import orjson
from fastapi import Depends
from fastapi_pagination import Page
from google.protobuf import json_format, text_format
from google.protobuf.json_format import ParseError as JsonParseError
from google.protobuf.message import DecodeError, Message
from google.protobuf.text_format import ParseError as TextParseError
from loguru import logger
from ord_schema.proto.dataset_pb2 import Dataset
from ord_schema.proto.reaction_pb2 import Reaction
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from ord_app.service_api.domain.auth import authenticate
from ord_app.service_api.domain.exceptions import EntityDoesNotExist
from ord_app.service_api.models import DatasetModel, UserModel
from ord_app.service_api.repositories.datasets import DatasetsRepository
from ord_app.service_api.repositories.reactions import ReactionsRepository
from ord_app.service_api.schemas.datasets import (
    DatasetCreateSchema,
    DatasetShareCreateSchema,
    DownloadFileFormats,
)
from ord_app.service_api.services.exceptions import ForbiddenError, ProtobufDecodeError, UnprocessableEntityError
from ord_app.service_api.services.postgresql import get_db_session


class DatasetUseCases:
    def __init__(self, db: AsyncSession, current_user: UserModel):
        self.db = db
        self.current_user = current_user
        self.dataset_repository = DatasetsRepository(db)
        self.reaction_repository = ReactionsRepository(db)

    async def create(
        self, group_id: int, payload: DatasetCreateSchema
    ) -> DatasetModel:
        dataset = await self.dataset_repository.create(group_id, self.current_user.id, payload.model_dump())
        return await self.dataset_repository.get(dataset.id)

    async def get(self, dataset_id: int) -> DatasetModel:
        dataset = await self.dataset_repository.get_with_sharable_info(dataset_id, self.current_user.id)
        await self.dataset_repository.enrich_datasets_with_user_roles([dataset], self.current_user.id)
        return dataset

    async def paginate_group_datasets(self, group_id: int) -> Page[DatasetModel]:
        return await self.dataset_repository.datasets_stmt(self.current_user.id, group_id)

    async def extend(self, dataset_id: int, file_data, kind):
        try:
            dataset_pb = await run_in_threadpool(load_message, file_data, Dataset, kind)
        except (DecodeError, JsonParseError, TextParseError) as e:
            logger.error(e)
            raise ProtobufDecodeError("An error occurred while reading the file.") from e

        dataset = await self.dataset_repository.get(dataset_id)
        await self.add_reactions(dataset, dataset_pb.reactions)
        dataset = await self.dataset_repository.update_modified_at(dataset_id)

        return dataset

    async def upload(self, group_id: int, file_data, kind):
        try:
            dataset_pb = await run_in_threadpool(load_message, file_data, Dataset, kind)
        except (DecodeError, JsonParseError, TextParseError) as e:
            logger.error(e)
            raise ProtobufDecodeError("An error occurred while reading the file.") from e

        dataset_payload = DatasetCreateSchema(name=dataset_pb.name, description=dataset_pb.description)
        dataset = await self.dataset_repository.create(
            group_id,
            self.current_user.id,
            payload=dataset_payload.model_dump(),
            autocommit=False
        )
        self.db.add(dataset)
        await self.db.commit()

        await self.add_reactions(dataset, dataset_pb.reactions)
        return dataset

    async def add_reactions(self, dataset, reactions):
        seen_ids = set()
        reactions_ids = []

        for reaction in reactions:
            if not reaction.reaction_id:
                reaction.reaction_id = uuid4().hex
            elif reaction.reaction_id in seen_ids:
                reaction.reaction_id = f"duplicate-{reaction.reaction_id}-{uuid4().hex}"
            else:
                reaction.reaction_id = (reaction.reaction_id or "").strip()
                if not reaction.reaction_id:
                    reaction.reaction_id = uuid4().hex

            seen_ids.add(reaction.reaction_id)
            reactions_ids.append(reaction.reaction_id)

        logger.debug(f"Start processing <Dataset(id={dataset.id})> Reactions. Count={len(reactions_ids)}")
        async for item in self.reaction_repository.get_by_reaction_ids_gen(dataset.id, reactions_ids):
            pb_reaction_idx = reactions_ids.index(item.pb_reaction_id)
            reactions[pb_reaction_idx].reaction_id = f"duplicate-{item.pb_reaction_id}-{uuid4().hex}"

        reactions_payload = [
            {
                "pb_reaction_id": reaction.reaction_id,
                "binpb": reaction.SerializeToString(),
                "dataset_id": dataset.id,
                "owner_id": self.current_user.id,
            }
            for reaction in reactions
        ]

        logger.debug(f"Reactions <Dataset(id={dataset.id})> are going to write to database")
        await self.reaction_repository.bulk_create(reactions_payload)
        logger.debug(f"Finished processing <Dataset(id={dataset.id})> Reactions.")

    async def paginate_user_datasets(self):
        return await self.dataset_repository.datasets_stmt(self.current_user.id)

    async def update(self, dataset_id: int, payload: DatasetCreateSchema) -> DatasetModel:
        await self.dataset_repository.update(dataset_id, payload.model_dump(exclude_unset=True))
        return await self.dataset_repository.get(dataset_id)

    async def delete(self, dataset_id: int):
        return await self.dataset_repository.delete(dataset_id)

    async def download(self, dataset_id: int, file_format: DownloadFileFormats) -> tuple[DatasetModel, bytes]:
        dataset = await self.dataset_repository.get_with_reactions(dataset_id)

        if not dataset:
            raise EntityDoesNotExist("Dataset not found")

        dataset_pb = load_message(
            orjson.dumps({"name": dataset.name, "description": dataset.description}),
            Dataset,
            "json"
        )

        dataset_pb.reactions.extend([Reaction.FromString(reaction.binpb) for reaction in dataset.reactions])

        data = await run_in_threadpool(write_message, dataset_pb, kind=file_format)
        return dataset, data

    async def share(self, primary_group_id: int, primary_dataset_id: int, payload: DatasetShareCreateSchema):
        if primary_group_id == payload.secondary_group_id:
            raise UnprocessableEntityError("Cannot share datasets with the same secondary group")

        dataset_group_association = (
            await self.dataset_repository.get_dataset_group_association(primary_group_id, primary_dataset_id)
        )
        if dataset_group_association:
            return await self.dataset_repository.share_dataset(primary_dataset_id, payload.secondary_group_id)

        raise ForbiddenError(f"Dataset {primary_dataset_id} not owned by {primary_group_id}")

    async def unshare(self, primary_group_id: int, primary_dataset_id: int, payload: DatasetShareCreateSchema):
        if primary_group_id == payload.secondary_group_id:
            raise UnprocessableEntityError("Cannot unshare datasets with the same secondary group")

        dataset_group_association = (
            await self.dataset_repository.get_dataset_group_association(primary_group_id, primary_dataset_id)
        )
        if dataset_group_association:
            return await self.dataset_repository.unshare_dataset(primary_dataset_id, payload.secondary_group_id)

        raise ForbiddenError(f"Dataset {primary_dataset_id} not owned by {primary_group_id}")


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


def get_dataset_use_case(
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(authenticate),
) -> DatasetUseCases:
    """
    A factory function that retrieves `db` and `current_user` via Depends,
    and then returns a fully initialized UseCase without any mention of Depends inside the UseCase itself.
    """
    return DatasetUseCases(db=db, current_user=current_user)
