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
from uuid import uuid4

from fastapi import Depends
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from google.protobuf.json_format import ParseError as JsonParseError
from google.protobuf.message import DecodeError
from google.protobuf.text_format import ParseError as TextParseError
from loguru import logger
from ord_schema.proto.reaction_pb2 import Reaction
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.auth import authenticate
from ord_app.service_api.domain.datasets import load_message, write_message
from ord_app.service_api.models import ReactionModel, UserModel
from ord_app.service_api.repositories.reactions import ReactionsRepository
from ord_app.service_api.schemas.datasets import DownloadFileFormats
from ord_app.service_api.schemas.reactions import ReactionCreateSchema
from ord_app.service_api.services.exceptions import (
    EntityNotFoundError,
    ProtobufDecodeError,
    UniqueViolation,
    psycopg_error_wrapper,
)
from ord_app.service_api.services.postgresql import get_db_session


class ReactionsUseCase:
    model = ReactionModel

    def __init__(self, db: AsyncSession, current_user: UserModel):
        self.db = db
        self.current_user = current_user
        self.reaction_repo = ReactionsRepository(db)

    @psycopg_error_wrapper
    async def _create_reaction(self, dataset_id: int, insert_data: dict):
        reaction = await self.reaction_repo.create(
            dataset_id,
            self.current_user.id,
            insert_data,
            autocommit=False
        )

        self.db.add(reaction)
        await self.db.flush()

        # Update pb_reaction_id and binpb based on whether binpb is already set
        if reaction.binpb is None:
            reaction.pb_reaction_id = reaction.id  # Use reaction.id as fallback
            reaction.binpb = Reaction(reaction_id=str(reaction.id)).SerializeToString()
        else:
            message = load_message(reaction.binpb, Reaction, "binpb")
            # If the loaded message has a valid reaction_id, use it; otherwise, fallback to reaction.id
            reaction.pb_reaction_id = message.reaction_id or reaction.id

        await self.db.commit()
        await self.db.refresh(reaction)
        return reaction

    async def create(self, dataset_id: int, payload: ReactionCreateSchema):
        pb_reaction = load_message(payload.binpb, Reaction, "binpb")

        if db_reaction := await self.reaction_repo.get(pb_reaction_id=pb_reaction.reaction_id):
            pb_reaction.reaction_id = f"duplicate-{db_reaction.pb_reaction_id}-{uuid4().hex}"

        insert_data = {"binpb": pb_reaction.SerializeToString(), "pb_reaction_id": uuid4().hex}
        reaction = await self._create_reaction(dataset_id, insert_data)
        return reaction

    async def upload(self, dataset_id: int, file_data, kind):
        try:
            pb_reaction = load_message(file_data, Reaction, kind)
        except (DecodeError, JsonParseError, TextParseError) as e:
            logger.error(f"Failed to read the file dataset_id={dataset_id}, kind={kind}: {e}")
            raise ProtobufDecodeError("An error occurred while reading the file.") from e

        if db_reaction := await self.reaction_repo.get(pb_reaction_id=pb_reaction.reaction_id):
            pb_reaction.reaction_id = f"duplicate-{db_reaction.pb_reaction_id}-{uuid4().hex}"

        insert_data = {"pb_reaction_id": uuid4().hex, "binpb": pb_reaction.SerializeToString()}
        reaction = await self._create_reaction(dataset_id, insert_data)
        return reaction

    async def paginate(self, dataset_id: int) -> Page[ReactionModel]:
        return await paginate(self.db, self.reaction_repo.all_reactions_stmt(dataset_id))

    async def get(self, reaction_id):
        return await self.reaction_repo.get(id=reaction_id)

    async def update(self, reaction_id, payload: ReactionCreateSchema):
        pb_reaction = load_message(payload.binpb, Reaction, "binpb")
        if await self.reaction_repo.get(pb_reaction_id=pb_reaction.reaction_id):
            raise UniqueViolation(f"Reaction with pb_reaction_id={pb_reaction.reaction_id} already exists")

        if reaction := await self.reaction_repo.update(payload.model_dump(exclude_unset=True), id=reaction_id):
            return reaction

        raise EntityNotFoundError("Reaction not found")

    async def download(self, reaction_id: int, file_format: DownloadFileFormats):
        if reaction := await self.reaction_repo.get(id=reaction_id):
            reaction_pb = write_message(Reaction.FromString(reaction.binpb), kind=file_format)
            return reaction, reaction_pb
        raise EntityNotFoundError("Reaction not found")


def get_reaction_use_case(
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(authenticate),
) -> ReactionsUseCase:
    """
    A factory function that retrieves `db` and `current_user` via Depends,
    and then returns a fully initialized UseCase without any mention of Depends inside the UseCase itself.
    """
    return ReactionsUseCase(db=db, current_user=current_user)
