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
from datetime import UTC, datetime
from uuid import uuid4

from fastapi import Depends
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from google.protobuf.json_format import ParseError as JsonParseError
from google.protobuf.message import DecodeError
from google.protobuf.text_format import ParseError as TextParseError
from loguru import logger
from ord_schema.proto.reaction_pb2 import DateTime, Person, Reaction, ReactionProvenance, RecordEvent
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from ord_app.service_api.domain.auth import authenticate
from ord_app.service_api.models import ReactionModel, UserModel
from ord_app.service_api.repositories.datasets import DatasetsRepository
from ord_app.service_api.repositories.reactions import ReactionsRepository
from ord_app.service_api.schemas.base import MAX_CRITICAL_FIELD_LENGTH
from ord_app.service_api.schemas.datasets import DownloadFileFormats
from ord_app.service_api.schemas.reactions import ReactionCreateSchema, ReactionsQueryParams, ReactionUpdateSchema
from ord_app.service_api.services.exceptions import (
    ConflictError,
    EntityNotFoundError,
    ProtobufDecodeError,
    UnprocessableEntityError,
)
from ord_app.service_api.services.pb_utils import (
    async_validate_pb_reaction,
    load_message,
    write_message,
)
from ord_app.service_api.services.postgresql import get_db_session


async def validate_dataset_reactions(db: AsyncSession, dataset_id: int | None = None):
    reaction_repo = ReactionsRepository(db)
    async for reactions in reaction_repo.stream_reactions(chunk_size=1000, dataset_id=dataset_id):

        update_values = []
        for reaction in reactions:

            pb_reaction = None
            if reaction.binpb is not None:
                pb_reaction = await run_in_threadpool(load_message, reaction.binpb, Reaction, "binpb")

            is_valid, *_ = await async_validate_pb_reaction(pb_reaction)
            update_values.append({"id": reaction.id, "is_valid": is_valid})

        try:
            await reaction_repo.bulk_update(update_values)
        except Exception as err:
            logger.error(f"Reaction bulk update failed: {err}")
        else:
            logger.info(f"Reaction bulk update succeeded updated {len(update_values)} reactions")


class CreateReactionsUseCases:
    pass


class ReactionsUseCase:
    model = ReactionModel

    def __init__(self, db: AsyncSession, current_user: UserModel):
        self.db = db
        self.current_user = current_user
        self.reaction_repo = ReactionsRepository(db)
        self.dataset_repo = DatasetsRepository(db)

    async def _create_reaction(self, dataset_id: int, pb_reaction: Reaction):
        # validate reaction id
        if len(pb_reaction.reaction_id) > MAX_CRITICAL_FIELD_LENGTH:
            raise UnprocessableEntityError(
                f"Reaction ID {pb_reaction.reaction_id} exceeds {MAX_CRITICAL_FIELD_LENGTH} characters"
            )
        pb_reaction.reaction_id = pb_reaction.reaction_id or uuid4().hex

        # validate reaction
        is_reaction_valid, errors, warnings = await async_validate_pb_reaction(pb_reaction)
        insert_data = {
            "pb_reaction_id": pb_reaction.reaction_id,
            "binpb": pb_reaction.SerializeToString(),
            "is_valid": is_reaction_valid,
        }

        # create orm object
        db_reaction = await self.reaction_repo.create(dataset_id, self.current_user.id, payload=insert_data)

        db_reaction.validation = {"errors": errors, "warnings": warnings}
        return db_reaction

    async def create(self, dataset_id: int, payload: ReactionCreateSchema):
        try:
            pb_reaction = await run_in_threadpool(load_message, payload.binpb, Reaction, "binpb")
        except (DecodeError, JsonParseError, TextParseError) as e:
            logger.error(f"Failed to load reaction dataset_id={dataset_id}, kind=binpb: {e}")
            raise ProtobufDecodeError("An error occurred while load reaction.") from e

        pb_reaction.reaction_id = (pb_reaction.reaction_id or "").strip()
        if db_reaction := await self.reaction_repo.get(pb_reaction_id=pb_reaction.reaction_id, dataset_id=dataset_id):
            pb_reaction.reaction_id = f"duplicate-{db_reaction.pb_reaction_id}_{uuid4().hex}"

        reaction = await self._create_reaction(dataset_id, pb_reaction)
        await self.dataset_repo.update_modified_at(dataset_id)
        return reaction

    async def create_from_scratch(self, dataset_id: int):
        person = Person(
            username=self.current_user.external_id,
            name=self.current_user.name,
            orcid=self.current_user.orcid_id,
            email=self.current_user.email,
        )
        record_event = RecordEvent(
            time=DateTime(value=datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")),
            person=person
        )
        provenance = ReactionProvenance(experimenter=person, record_created=record_event)
        pb_reaction = Reaction(provenance=provenance)

        reaction = await self._create_reaction(dataset_id, pb_reaction)
        await self.dataset_repo.update_modified_at(dataset_id)
        return reaction

    async def upload(self, dataset_id: int, file_data, kind):
        try:
            pb_reaction = await run_in_threadpool(load_message, file_data, Reaction, kind)
        except (DecodeError, JsonParseError, TextParseError) as e:
            logger.error(f"Failed to read the file dataset_id={dataset_id}, kind={kind}: {e}")
            raise ProtobufDecodeError("An error occurred while reading the file.") from e

        pb_reaction.reaction_id = (pb_reaction.reaction_id or "").strip()
        if db_reaction := await self.reaction_repo.get(pb_reaction_id=pb_reaction.reaction_id, dataset_id=dataset_id):
            pb_reaction.reaction_id = f"duplicate-{db_reaction.pb_reaction_id}_{uuid4().hex}"

        reaction = await self._create_reaction(dataset_id, pb_reaction)
        await self.dataset_repo.update_modified_at(dataset_id)

        is_valid, errors, warning = await async_validate_pb_reaction(pb_reaction)
        reaction.is_valid = is_valid
        reaction.validation = {"errors": errors, "warnings": warning}
        return reaction

    async def paginate(self, dataset_id: int, is_valid_query: ReactionsQueryParams) -> Page[ReactionModel]:
        return await paginate(
            self.db,
            self.reaction_repo.all_reactions_stmt(dataset_id, is_valid_query.model_dump(exclude_unset=True)),
        )

    async def get(self, dataset_id: int, reaction_id: int):
        if reaction := await self.reaction_repo.get(id=reaction_id, dataset_id=dataset_id):
            is_valid, errors, warning = await async_validate_pb_reaction(reaction.pb)
            reaction.validation = {"errors": errors, "warnings": warning}
            return reaction
        raise EntityNotFoundError(f"Reaction with id={reaction_id} not found")

    async def search(self, **kwargs):
        if reaction := await self.reaction_repo.get(**kwargs):
            return reaction
        raise EntityNotFoundError(f"Reaction with {kwargs} not found")

    async def update(self, dataset_id: int, reaction_id: int, payload: ReactionUpdateSchema):
        pb_reaction = await run_in_threadpool(load_message, payload.binpb, Reaction, "binpb")
        pb_reaction_id = (pb_reaction.reaction_id or "").strip()
        if len(pb_reaction_id) > MAX_CRITICAL_FIELD_LENGTH:
            raise UnprocessableEntityError(
                f"Reaction ID {pb_reaction_id} exceeds {MAX_CRITICAL_FIELD_LENGTH} characters"
            )
        pb_reaction.reaction_id = pb_reaction_id

        db_reaction = await self.reaction_repo.get(id=reaction_id, dataset_id=dataset_id)
        if db_reaction is None:
            raise EntityNotFoundError(f"Reaction with id={reaction_id} not found")

        duplicated_reactions = await self.reaction_repo.find_duplicated_by_pb_reaction_id(
            dataset_id=dataset_id,
            pb_reaction_id=pb_reaction.reaction_id,
            exclude_pb_reaction_ids=[db_reaction.pb_reaction_id]
        )
        if duplicated_reactions:
            raise ConflictError(f"Reaction with id={pb_reaction.reaction_id} already exists")

        is_valid, errors, warning = await async_validate_pb_reaction(pb_reaction)
        updating_data = {
            "binpb": pb_reaction.SerializeToString(),
            "pb_reaction_id": pb_reaction.reaction_id,
            "is_valid": is_valid,
        }

        reaction = await self.reaction_repo.update(updating_data, id=reaction_id, dataset_id=dataset_id)
        await self.dataset_repo.update_modified_at(dataset_id)
        reaction.validation = {"errors": errors, "warnings": warning}
        return reaction

    async def delete(self, dataset_id: int, reaction_id: int):
        await self.reaction_repo.delete(dataset_id=dataset_id, id=reaction_id)
        await self.dataset_repo.update_modified_at(dataset_id)

    async def download(self, dataset_id: int, reaction_id: int, file_format: DownloadFileFormats):
        if reaction := await self.reaction_repo.get(id=reaction_id, dataset_id=dataset_id):
            reaction_pb = await run_in_threadpool(write_message, Reaction.FromString(reaction.binpb), kind=file_format)
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
