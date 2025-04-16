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

from ord_schema.proto.reaction_pb2 import Reaction

from ord_app.service_api.services.pb_utils import load_message
from ord_app.tests.conftest import create_test_dataset


async def test_create_reaction_from_scratch(api_client, mock_authenticated_user, test_db_session):
    user, *_ = mock_authenticated_user
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)

    response_data = api_client.post(f"/api/v1/datasets/{dataset.id}/reactions/from-scratch").raise_for_status().json()
    reaction_pb = load_message(b64decode(response_data["binpb"]), Reaction, "binpb")
    assert reaction_pb.reaction_id == response_data["pb_reaction_id"]

    record_event = reaction_pb.provenance.record_created
    person = record_event.person
    assert bool(record_event.time)

    experimenter = reaction_pb.provenance.experimenter
    assert experimenter.username == person.username == user.external_id
    assert experimenter.email == person.email == user.email
    assert experimenter.name == person.name == user.name
    assert experimenter.orcid == person.orcid == user.orcid_id

