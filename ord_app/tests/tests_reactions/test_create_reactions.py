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

from ord_schema.proto.dataset_pb2 import Dataset
from ord_schema.proto.reaction_pb2 import Reaction

from ord_app.service_api.domain.datasets import load_message
from ord_app.service_api.settings import RuntimeSettings
from ord_app.tests.conftest import create_test_dataset


async def test_create_reaction_with_pb(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)

    with open(RuntimeSettings.base_dir.parent/"tests"/"testdata"/"ord-nielsen-example.txtpb", "rb") as fd:
        pb_dataset = load_message(fd.read(), Dataset, "txtpb")
        pb_reaction = pb_dataset.reactions[0]
        pb_reaction.reaction_id = "test"

    payload = {"binpb": b64encode(pb_reaction.SerializeToString()).decode()}

    response_data = api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload).raise_for_status().json()
    reaction_pb = load_message(b64decode(response_data["binpb"]), Reaction, "binpb")
    assert reaction_pb.reaction_id == response_data["pb_reaction_id"] == "test"
    assert response_data["is_valid"] is True
    assert response_data["validation"] == {"errors": [], "warnings": []}


async def test_upload_reaction(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    pb_reaction = Reaction(reaction_id="test")

    response_data = api_client.post(
        f"/api/v1/datasets/{dataset.id}/reactions/upload",
        files={"file": ("reaction.pb", pb_reaction.SerializeToString())}
    ).raise_for_status().json()
    assert response_data["pb_reaction_id"] == pb_reaction.reaction_id


async def test_upload_reaction_with_duplicate_reaction_id(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    pb_reaction = Reaction(reaction_id="test")

    response_data = api_client.post(
        f"/api/v1/datasets/{dataset.id}/reactions/upload",
        files={"file": ("reaction.pb", pb_reaction.SerializeToString())}
    ).raise_for_status().json()
    assert response_data["pb_reaction_id"] == pb_reaction.reaction_id

    response_data = api_client.post(
        f"/api/v1/datasets/{dataset.id}/reactions/upload",
        files={"file": ("reaction.pb", pb_reaction.SerializeToString())}
    ).raise_for_status().json()
    assert response_data["pb_reaction_id"].startswith("duplicate-test")


async def test_create_with_duplicate_reaction_id(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    payload = {"binpb": b64encode(Reaction(reaction_id="test").SerializeToString()).decode()}

    response_data = api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload).raise_for_status().json()
    assert response_data["pb_reaction_id"] == "test"

    response_data = api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload).raise_for_status().json()
    assert response_data["pb_reaction_id"].startswith("duplicate-test")


async def test_create_duplicate_reaction_without_reaction_id(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    payload = {"binpb": b64encode(Reaction().SerializeToString()).decode()}

    response_data1 = api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload).raise_for_status().json()
    response_data2 = api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload).raise_for_status().json()
    assert response_data1["id"] != response_data2["id"]
    assert response_data1["pb_reaction_id"] != response_data2["pb_reaction_id"]
