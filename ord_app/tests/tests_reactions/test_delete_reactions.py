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

from fastapi import status
from ord_schema.proto.reaction_pb2 import Reaction

from ord_app.tests.conftest import create_test_dataset


async def test_delete_reaction(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)

    payload = {"binpb": b64encode(Reaction(reaction_id="test").SerializeToString()).decode()}
    response_data = api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload).raise_for_status().json()
    reaction_id = response_data["id"]

    response = api_client.delete(f"/api/v1/datasets/{dataset.id}/reactions/{reaction_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    response_data = api_client.get(f"/api/v1/datasets/{dataset.id}/reactions/{reaction_id}")

    assert response_data.status_code == status.HTTP_404_NOT_FOUND
