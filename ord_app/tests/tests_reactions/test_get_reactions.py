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
import json

from ord_app.tests.conftest import create_test_dataset, create_test_reaction


async def test_paginate_reactions(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    await create_test_reaction(test_db_session, mock_authenticated_user, dataset)

    response_data = api_client.get(f"/api/v1/datasets/{dataset.id}/reactions").raise_for_status().json()
    assert response_data["total"] == 1

async def test_paginate_query_reactions(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    reaction_is_valid_none = await create_test_reaction(test_db_session, mock_authenticated_user, dataset)
    reaction_is_valid_true = await create_test_reaction(
        test_db_session, mock_authenticated_user, dataset, is_valid=True
    )
    reaction_is_valid_false = await create_test_reaction(
        test_db_session, mock_authenticated_user, dataset, is_valid=False
    )

    response_data = api_client.get(f"/api/v1/datasets/{dataset.id}/reactions").raise_for_status().json()
    assert response_data["total"] == 3

    response_data = api_client.get(f"/api/v1/datasets/{dataset.id}/reactions?is_valid=true").raise_for_status().json()
    assert response_data["total"] == 1
    assert response_data["items"][0]["id"] == reaction_is_valid_true.id
    assert response_data["items"][0]["is_valid"] is True

    response_data = api_client.get(f"/api/v1/datasets/{dataset.id}/reactions?is_valid=false").raise_for_status().json()
    assert response_data["total"] == 1
    assert response_data["items"][0]["id"] == reaction_is_valid_false.id
    assert response_data["items"][0]["is_valid"] is False

    response_data = api_client.get(f"/api/v1/datasets/{dataset.id}/reactions?is_valid=null").raise_for_status().json()
    assert response_data["total"] == 1
    assert response_data["items"][0]["id"] == reaction_is_valid_none.id
    assert response_data["items"][0]["is_valid"] is None

    response_data = api_client.get(
        f"/api/v1/datasets/{dataset.id}/reactions?is_valid=false&is_valid=null"
    ).raise_for_status().json()
    assert response_data["total"] == 2
    assert response_data["items"][0]["id"] == reaction_is_valid_none.id
    assert response_data["items"][0]["is_valid"] is None
    assert response_data["items"][1]["id"] == reaction_is_valid_false.id
    assert response_data["items"][1]["is_valid"] is False


async def test_get_reaction(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    reaction = await create_test_reaction(test_db_session, mock_authenticated_user, dataset)

    response_data = api_client.get(f"/api/v1/datasets/{dataset.id}/reactions/{reaction.id}").raise_for_status().json()
    assert response_data["id"] == reaction.id


async def test_search_reaction(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    reaction = await create_test_reaction(test_db_session, mock_authenticated_user, dataset)

    response_data = api_client.get(
        f"/api/v1/datasets/{dataset.id}/reactions/search?pb_reaction_id={reaction.pb_reaction_id}"
    ).raise_for_status().json()
    assert response_data["id"] == reaction.id


async def test_download_reaction(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    reaction = await create_test_reaction(test_db_session, mock_authenticated_user, dataset)

    response_data = api_client.get(
        f"/api/v1/datasets/{dataset.id}/reactions/{reaction.id}/download?file_format=json"
    ).raise_for_status()

    decompressed_data = json.loads(response_data.content)
    assert decompressed_data["reactionId"] == reaction.pb_reaction_id
