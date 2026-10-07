# Copyright 2026 Open Reaction Database Project Authors
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
from ord_schema.proto.reaction_pb2 import Reaction
from sqlalchemy import delete, update

from ord_app.conftest import create_test_dataset, create_test_reaction, db_session_maker
from ord_app.service_api.models import ReactionModel
from ord_app.service_api.repositories.reactions import ReactionsRepository


async def test_stream_binpbs_yields_chunks_in_id_order(
    test_db_session, mock_authenticated_user
):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    other = await create_test_dataset(test_db_session, mock_authenticated_user)
    reactions = []
    for _ in range(5):
        reactions.append(
            await create_test_reaction(
                test_db_session, mock_authenticated_user, dataset
            )
        )
        await create_test_reaction(test_db_session, mock_authenticated_user, other)

    chunks = [
        chunk
        async for chunk in ReactionsRepository(test_db_session).stream_binpbs(
            dataset.id, chunk_size=2
        )
    ]

    assert [len(chunk) for chunk in chunks] == [2, 2, 1]
    assert [binpb for chunk in chunks for binpb in chunk] == [
        reaction.binpb for reaction in reactions
    ]


async def test_stream_binpbs_reads_one_snapshot(
    test_db_session, mock_authenticated_user
):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    reactions = [
        await create_test_reaction(test_db_session, mock_authenticated_user, dataset)
        for _ in range(5)
    ]
    expected = [reaction.binpb for reaction in reactions]

    async with db_session_maker() as session:
        chunks = ReactionsRepository(session).stream_binpbs(dataset.id, chunk_size=2)
        streamed = list(await anext(chunks))
        # Edit, delete, and add reactions from another session between chunks.
        await test_db_session.execute(
            update(ReactionModel)
            .where(ReactionModel.id == reactions[3].id)
            .values(binpb=Reaction(reaction_id="edited").SerializeToString())
        )
        await test_db_session.execute(
            delete(ReactionModel).where(ReactionModel.id == reactions[4].id)
        )
        await test_db_session.commit()
        await create_test_reaction(test_db_session, mock_authenticated_user, dataset)
        streamed += [binpb async for chunk in chunks for binpb in chunk]

    assert streamed == expected
