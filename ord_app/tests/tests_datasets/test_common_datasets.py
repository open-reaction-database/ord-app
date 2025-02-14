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
from datetime import datetime

from faker import Faker
from ord_schema.proto.reaction_pb2 import Reaction

fake = Faker()

def parse_dt(dt):
    return datetime.strptime(dt, '%Y-%m-%dT%H:%M:%S.%f')


async def test_dataset_modified_at(api_client, mock_authenticated_user):
    user, _, group = mock_authenticated_user

    payload = {"name": fake.company(), "description": fake.text(5)}
    resp1 = api_client.post(f"/api/v1/groups/{group.id}/datasets", json=payload).raise_for_status().json()
    dataset_id = resp1["id"]

    resp2 = api_client.patch(f"/api/v1/datasets/{dataset_id}", json=payload).raise_for_status().json()
    assert parse_dt(resp1["modified_at"]) < parse_dt(resp2["modified_at"])

    # create reaction
    reaction_resp = api_client.post(f"/api/v1/datasets/{dataset_id}/reactions", json={}).raise_for_status().json()
    resp3 = api_client.get(f"/api/v1/datasets/{dataset_id}").raise_for_status().json()
    assert parse_dt(resp2["modified_at"]) < parse_dt(resp3["modified_at"])

    # update reaction
    payload = {"binpb": b64encode(Reaction(reaction_id="updated").SerializeToString()).decode()}
    api_client.patch(
        f"/api/v1/datasets/{dataset_id}/reactions/{reaction_resp['id']}", json=payload
    ).raise_for_status().json()
    resp4 = api_client.get(f"/api/v1/datasets/{dataset_id}").raise_for_status().json()
    assert parse_dt(resp3["modified_at"]) < parse_dt(resp4["modified_at"])
