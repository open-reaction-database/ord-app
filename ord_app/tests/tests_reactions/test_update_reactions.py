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
from ord_app.service_api.models import DatasetGroupAssociationModel, DatasetModel


async def test_update_reaction(api_client, mock_authenticated_user, test_db_session):
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

    payload = {"name": "updated name"}
    response_data = api_client.patch(
        f"/api/v1/datasets/{dataset.id}/reactions/{reaction_id}",
        json=payload
    ).raise_for_status().json()

    assert response_data["name"] == payload["name"]

