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
from fastapi import Depends
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from ord_schema.proto.reaction_pb2 import Reaction
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.domain.auth import authenticate
from ord_app.service_api.domain.datasets import write_message
from ord_app.service_api.models import ReactionModel, UserModel
from ord_app.service_api.repositories.reactions import ReactionsRepository
from ord_app.service_api.schemas.datasets import DownloadFileFormats
from ord_app.service_api.schemas.reactions import ReactionCreateSchema
from ord_app.service_api.services.postgresql import get_db_session


class ReactionsUseCase:
    def __init__(self, db: AsyncSession, current_user: UserModel):
        self.db = db
        self.current_user = current_user
        self.reaction_repository = ReactionsRepository(db)

    async def create(self, dataset_id: int, payload: ReactionCreateSchema):
        reaction = await self.reaction_repository.create(
            dataset_id, self.current_user.id, payload.model_dump(exclude_unset=True), autocommit=False
        )
        self.db.add(reaction)

        # set default id for Reaction BF
        if reaction.binpb is None:
            await self.db.flush()
            reaction.binpb = Reaction(reaction_id=str(reaction.id)).SerializeToString()

        await self.db.commit()
        await self.db.refresh(reaction)
        return reaction

    async def paginate(self, dataset_id: int) -> Page[ReactionModel]:
        stmt = self.reaction_repository.all_reactions_stmt(dataset_id)
        return await paginate(self.db, stmt)

    async def get(self, dataset_id):
        return await self.reaction_repository.get(dataset_id)

    async def update(self, reaction_id, payload: ReactionCreateSchema):
        return await self.reaction_repository.update(reaction_id, payload.model_dump(exclude_unset=True))

    async def download(self, reaction_id: int, file_format: DownloadFileFormats):
        reaction = await self.reaction_repository.get(reaction_id)
        reaction_pb = write_message(Reaction.FromString(reaction.binpb), kind=file_format)
        return reaction, reaction_pb


# async def get_reactions(db_session: AsyncSession, user: UserModel, dataset_id: int) -> Sequence[ReactionModel]:
#     stmt = select(ReactionModel).where(
#         ReactionModel.dataset_id == dataset_id,
#         ReactionModel.owner == user,
#     )
#     return (await db_session.scalars(stmt)).all()
#
#
# async def update_reactions(
#     db_session: AsyncSession,
#     reaction_id: int,
#     payload: ReactionCreateSchema,
# ) -> ReactionModel:
#     stmt = (
#         update(ReactionModel)
#         .where(ReactionModel.id == reaction_id)
#         .values(**payload.model_dump(exclude_unset=True))
#         .returning(ReactionModel)
#     )
#     result = await db_session.scalar(stmt)
#     await db_session.commit()
#     return result
#
#
# async def paginate_reactions(db_session: AsyncSession, dataset_id: int) -> Page[ReactionModel]:
#     stmt = select(ReactionModel).where(ReactionModel.dataset_id == dataset_id)
#     return await paginate(db_session, stmt)
#
#
# async def get_reaction(
#     db_session: AsyncSession,
#     reaction_id: int,
# ):
#     stmt = select(ReactionModel).where(ReactionModel.id == reaction_id).limit(1)
#     return await db_session.scalar(stmt)
#
#
# async def create_reaction(
#     db_session: AsyncSession, dataset_id: int, user: UserModel, payload: ReactionCreateSchema
# ) -> ReactionModel:
#     reaction = ReactionModel(owner=user, dataset_id=dataset_id, **payload.model_dump())
#     db_session.add(reaction)
#
#     # set default id for Reaction BF
#     if reaction.binpb is None:
#         await db_session.flush()
#         reaction.binpb = Reaction(reaction_id=str(reaction.id)).SerializeToString()
#
#     await db_session.commit()
#     await db_session.refresh(reaction)
#     return reaction
#
#
# async def download_reaction(
#     db_session: AsyncSession,
#     reaction_id: int,
#     file_format: DownloadFileFormats,
# ) -> tuple[ReactionModel, bytes]:
#     reaction = await get_reaction(db_session, reaction_id)
#     data = write_message(Reaction.FromString(reaction.binpb), kind=file_format)
#     return reaction, data
#

def get_reaction_use_case(
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(authenticate),
) -> ReactionsUseCase:
    """
    A factory function that retrieves `db` and `current_user` via Depends,
    and then returns a fully initialized UseCase without any mention of Depends inside the UseCase itself.
    """
    return ReactionsUseCase(db=db, current_user=current_user)
