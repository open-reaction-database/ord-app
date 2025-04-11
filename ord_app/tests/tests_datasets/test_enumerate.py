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

from faker import Faker
from ord_schema.proto.reaction_pb2 import Reaction

faker = Faker()

async def test_create_enumerate_dataset(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user
    payload = {
        "name": faker.name(),
        "description": faker.text(),
        "reactions": [
            b64encode(Reaction(reaction_id=faker.uuid4()).SerializeToString()).decode(),
            b64encode(Reaction(reaction_id=faker.uuid4()).SerializeToString()).decode(),
        ]
    }

    dataset = api_client.post(
        f"/api/v1/groups/{group.id}/datasets/enumerate", json=payload,
    ).raise_for_status().json()
    response_data = api_client.get(f"/api/v1/datasets/{dataset['id']}").raise_for_status().json()
    assert response_data["name"] == payload["name"]
    assert response_data["description"] == payload["description"]
    assert response_data["reactions_count"]["total"] == len(payload["reactions"])
    assert response_data["groups"] == [{"id": group.id, "role": "admin", "name": group.name}]

    response_data = api_client.get(f"/api/v1/datasets/{dataset['id']}/reactions").raise_for_status().json()
    assert response_data["total"] == len(payload["reactions"])

    payload = {
        "reactions": [
            b64encode(Reaction(reaction_id=faker.uuid4()).SerializeToString()).decode(),
            b64encode(Reaction(reaction_id=faker.uuid4()).SerializeToString()).decode(),
        ]
    }
    api_client.post(
        f"/api/v1/datasets/{dataset['id']}/enumerate/extend", json=payload,
    )

    response_data = api_client.get(f"/api/v1/datasets/{dataset['id']}/reactions").raise_for_status().json()
    assert response_data["total"] == 4
