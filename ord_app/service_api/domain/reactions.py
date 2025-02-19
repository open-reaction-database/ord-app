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

from ord_app.service_api.domain.auth import authenticate
from ord_app.service_api.domain.datasets import load_message, write_message
from ord_app.service_api.models import ReactionModel, UserModel
from ord_app.service_api.repositories.datasets import DatasetsRepository
from ord_app.service_api.repositories.reactions import ReactionsRepository
from ord_app.service_api.schemas.datasets import DownloadFileFormats
from ord_app.service_api.schemas.reactions import ReactionCreateSchema, ReactionUpdateSchema
from ord_app.service_api.services.exceptions import (
    EntityNotFoundError,
    ProtobufDecodeError,
    psycopg_error_wrapper,
)
from ord_app.service_api.services.pb_utils import validate_pb_reaction
from ord_app.service_api.services.postgresql import get_db_session


async def validate_reactions_task(db: AsyncSession):
    reaction_repo = ReactionsRepository(db)
    update_values = []

    async for reactions_chunk in reaction_repo.stream_reactions():
        for reaction in reactions_chunk:
            pb_reaction = load_message(reaction.binpb, Reaction, "binpb")
            try:
                validation_result = validate_pb_reaction(pb_reaction)
            except ValueError as err:
                validation_result = [err], []

            if any(validation_result):
                update_values.append({"id": reaction.id, "is_valid": False})
                logger.debug(f"Reaction validation failed: {validation_result}")
            else:
                update_values.append({"id": reaction.id, "is_valid": True})

    await reaction_repo.bulk_update(update_values)


class ReactionsUseCase:
    model = ReactionModel

    def __init__(self, db: AsyncSession, current_user: UserModel):
        self.db = db
        self.current_user = current_user
        self.reaction_repo = ReactionsRepository(db)
        self.dataset_repo = DatasetsRepository(db)

    @staticmethod
    def validate(binpb) -> tuple[bool, list[str], list[str] | list]:
        is_valid = False

        try:
            errors, warnings = validate_pb_reaction(binpb)
        except ValueError as err:
            errors, warnings = [str(err)], []

        if not any((errors, warnings)):
            is_valid = True

        return is_valid, errors, warnings

    def set_provenance(self, pb_reaction: Reaction):
        person = Person(
            username=self.current_user.external_id,
            name=self.current_user.name,
            orcid=self.current_user.orcid_id,
            email=self.current_user.email,
        )
        pb_reaction.provenance.experimenter = person

        dt = DateTime(value=datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"))
        pb_reaction.provenance.record_created = RecordEvent(time=dt, person=person)


    @psycopg_error_wrapper
    async def _create_reaction(self, dataset_id: int, insert_data: dict):
        if "binpb" in insert_data:
            try:
                validation_result = validate_pb_reaction(insert_data["binpb"])
            except ValueError as err:
                validation_result = [err], []

            insert_data["binpb"] = insert_data["binpb"].SerializeToString()
        else:
            validation_result = [], []

        reaction = await self.reaction_repo.create(
            dataset_id,
            self.current_user.id,
            insert_data,
            autocommit=False
        )

        # Validation
        if any(validation_result):
            errors, warnings = validation_result
            # This field is written to the database
            reaction.is_valid = False

            # And this is not, it is only stored in the object
            # There is no need to store these fields in the database yet
            reaction.validation = {"errors": errors, "warnings": warnings}
        else:
            reaction.is_valid = True  # same
            reaction.validation = {"errors": [], "warnings": []}  # same

        self.db.add(reaction)
        await self.db.flush()

        # Update pb_reaction_id and binpb based on whether binpb is already set
        if reaction.binpb is None:
            reaction.pb_reaction_id = reaction.id  # Use reaction.id as fallback
            reaction.binpb = Reaction(reaction_id=str(reaction.id)).SerializeToString()
        else:
            pb_reaction = load_message(reaction.binpb, Reaction, "binpb")
            # If the loaded message has a valid reaction_id, use it; otherwise, fallback to reaction.id
            reaction.pb_reaction_id = pb_reaction.reaction_id = str(pb_reaction.reaction_id or reaction.id)
            reaction.binpb = pb_reaction.SerializeToString()

        await self.db.commit()
        await self.db.refresh(reaction)

        return reaction

    async def create(self, dataset_id: int, payload: ReactionCreateSchema):
        insert_data = {"pb_reaction_id": uuid4().hex}

        if payload.binpb is not None:
            pb_reaction = load_message(payload.binpb, Reaction, "binpb")
            if db_reaction := await self.reaction_repo.get(pb_reaction_id=pb_reaction.reaction_id):
                pb_reaction.reaction_id = f"duplicate-{db_reaction.pb_reaction_id}-{uuid4().hex}"
            insert_data["binpb"] = pb_reaction

        reaction = await self._create_reaction(dataset_id, insert_data)
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

        insert_data = {"pb_reaction_id": uuid4().hex, "binpb": pb_reaction}
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

        insert_data = {"pb_reaction_id": uuid4().hex, "binpb": pb_reaction}
        reaction = await self._create_reaction(dataset_id, insert_data)
        await self.dataset_repo.update_modified_at(dataset_id)
        return reaction

    async def paginate(self, dataset_id: int) -> Page[ReactionModel]:
        return await paginate(self.db, self.reaction_repo.all_reactions_stmt(dataset_id))

    async def get(self, reaction_id):
        if reaction := await self.reaction_repo.get(id=reaction_id):
            return reaction
        raise EntityNotFoundError(f"Reaction with id={reaction_id} not found")

    async def update(self, dataset_id: int, reaction_id: int, payload: ReactionUpdateSchema):
        updating_data = payload.model_dump() | {"pb_reaction_id": payload.binpb.reaction_id}

        if reaction := await self.reaction_repo.update(updating_data, id=reaction_id, dataset_id=dataset_id):
            await self.dataset_repo.update_modified_at(dataset_id)
            return reaction

        raise EntityNotFoundError("Reaction not found")

    async def delete(self, dataset_id: int, reaction_id: int):
        await self.reaction_repo.delete(dataset_id=dataset_id, id=reaction_id)

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
