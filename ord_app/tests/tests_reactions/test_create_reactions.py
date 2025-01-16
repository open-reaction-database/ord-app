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
from base64 import b64decode

from google.protobuf import text_format
from ord_schema.proto.dataset_pb2 import Dataset
from ord_schema.proto.reaction_pb2 import Reaction

from ord_app.service_api.domain.datasets import load_message, write_message
from ord_app.service_api.models import DatasetGroupAssociationModel, DatasetModel
from ord_app.service_api.settings import RuntimeSettings


async def test_create_reaction(api_client, mock_authenticated_user, test_db_session):
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

    assert response_data["name"] == payload["name"]
    reaction_pb = load_message(b64decode(response_data["binpb"]), Reaction, "binpb")
    assert reaction_pb.reaction_id == str(response_data["id"])


async def test_upload_reaction(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user

    dataset = DatasetModel(owner=user, name="init", description="init")
    test_db_session.add(dataset)
    await test_db_session.flush()

    test_db_session.add(
        DatasetGroupAssociationModel(dataset=dataset, group=group)
    )
    await test_db_session.commit()

    with open(RuntimeSettings.base_dir.parent/"tests"/"testdata"/"full.txtpb", "r") as fd:
        dataset_pb = text_format.Parse(fd.read(), Dataset())
        reaction = dataset_pb.reactions[0]

    # reaction_file = write_message(Reaction.FromString(reaction.binpb), kind="txtpb")
    response_data = api_client.post(
        f"/api/v1/datasets/{dataset.id}/reactions/upload",
        files={"file": ("reaction.txtpb", write_message(reaction, kind="txtpb"))}
    ).raise_for_status().json()

    assert response_data["name"] == reaction.reaction_id
