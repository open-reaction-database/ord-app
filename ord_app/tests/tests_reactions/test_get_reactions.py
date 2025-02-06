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

from ord_app.service_api.models import DatasetGroupAssociationModel, DatasetModel


async def test_paginate_reactions(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user

    dataset = DatasetModel(owner=user, name="init", description="init")
    test_db_session.add(dataset)
    await test_db_session.flush()

    test_db_session.add(
        DatasetGroupAssociationModel(dataset=dataset, group=group)
    )
    await test_db_session.commit()

    api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json={}).raise_for_status()

    response_data = api_client.get(f"/api/v1/datasets/{dataset.id}/reactions").raise_for_status().json()

    assert response_data["total"] == 1


async def test_get_reaction(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user

    dataset = DatasetModel(owner=user, name="init", description="init")
    test_db_session.add(dataset)
    await test_db_session.flush()

    test_db_session.add(
        DatasetGroupAssociationModel(dataset=dataset, group=group)
    )
    await test_db_session.commit()

    payload = {"name": "test reaction name"}
    response_data = api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload).raise_for_status().json()
    reaction_id = response_data["id"]

    response_data = api_client.get(f"/api/v1/datasets/{dataset.id}/reactions/{reaction_id}").raise_for_status().json()

    assert response_data["id"] == reaction_id


async def test_download_reaction(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user

    dataset = DatasetModel(owner=user, name="init", description="init")
    test_db_session.add(dataset)
    await test_db_session.flush()

    test_db_session.add(
        DatasetGroupAssociationModel(dataset=dataset, group=group)
    )
    await test_db_session.commit()

    response_data = api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json={}).raise_for_status().json()
    reaction_id = response_data["id"]

    response_data = api_client.get(
        f"/api/v1/datasets/{dataset.id}/reactions/{reaction_id}/download?file_format=json"
    ).raise_for_status()

    decompressed_data = json.loads(response_data.content)
    assert decompressed_data["reactionId"] == str(reaction_id)
