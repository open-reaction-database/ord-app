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
from sqlalchemy import select

from ord_app.service_api.models import TemplateModel

fake = Faker()


async def test_create_template(api_client, mock_authenticated_user, test_db_session):
    user, *_, = mock_authenticated_user

    payload = {
        "binpb": b64encode(Reaction(reaction_id=fake.uuid4()).SerializeToString()).decode(),
        "name": fake.name(),
        "variables": {"foo": "bar"},
    }
    response_data = api_client.post("/api/v1/templates", json=payload).raise_for_status().json()

    stmt = select(TemplateModel).where(TemplateModel.id == response_data["id"])
    db_template = await test_db_session.scalar(stmt)
    assert db_template.name == payload["name"]
