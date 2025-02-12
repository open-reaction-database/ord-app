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
from base64 import b64decode, b64encode

from fastapi import status
from ord_schema.proto.reaction_pb2 import Reaction

from ord_app.service_api.domain.datasets import load_message
from ord_app.tests.conftest import create_test_dataset


async def test_update_reaction(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)

    payload = {"binpb": b64encode(Reaction(reaction_id="test").SerializeToString()).decode()}
    response_data = api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload).raise_for_status().json()
    reaction_id = response_data["id"]

    payload = {"binpb": b64encode(Reaction(reaction_id="updated").SerializeToString()).decode()}
    response_data = api_client.patch(
        f"/api/v1/datasets/{dataset.id}/reactions/{reaction_id}",
        json=payload
    ).raise_for_status().json()

    reaction_pb = load_message(b64decode(response_data["binpb"]), Reaction, "binpb")
    assert reaction_pb.reaction_id == "updated"


async def test_update_nonexistent_reaction(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    payload = {"binpb": b64encode(Reaction(reaction_id="test").SerializeToString()).decode()}
    response_data = api_client.patch(f"/api/v1/datasets/{dataset.id}/reactions/{100500}", json=payload)

    assert status.HTTP_404_NOT_FOUND == response_data.status_code


async def test_update_reaction_with_duplicate_reaction_id(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)

    # create reaction
    payload = {"binpb": b64encode(Reaction(reaction_id="test").SerializeToString()).decode()}
    response_data = api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload).raise_for_status().json()
    assert "test" == response_data["pb_reaction_id"]

    # update created reaction with new `reaction_id`
    payload = {"binpb": b64encode(Reaction(reaction_id="test").SerializeToString()).decode()}
    response_data = api_client.patch(
        f"/api/v1/datasets/{dataset.id}/reactions/{response_data['id']}", json=payload
    ).raise_for_status().json()
    assert response_data["pb_reaction_id"] == "test"

    # try to create new reaction with the reaction_id="updated"
    payload = {"binpb": b64encode(Reaction(reaction_id="test").SerializeToString()).decode()}
    response = api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload).raise_for_status().json()
    assert "duplicate-test" in response["pb_reaction_id"]
