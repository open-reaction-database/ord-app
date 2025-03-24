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
from fastapi import status
from ord_schema.proto.reaction_pb2 import Reaction
from sqlalchemy import select

from ord_app.service_api.models import TemplateModel
from ord_app.service_api.schemas.base import MAX_CRITICAL_FIELD_LENGTH

fake = Faker()


async def test_create_template(api_client, mock_authenticated_user, test_db_session):
    payload = {
        "binpb": b64encode(Reaction(reaction_id=fake.uuid4()).SerializeToString()).decode(),
        "name": fake.name(),
        "variables": {"foo": "bar"},
    }
    response_data = api_client.post("/api/v1/templates", json=payload).raise_for_status().json()

    stmt = select(TemplateModel).where(TemplateModel.id == response_data["id"])
    db_template = await test_db_session.scalar(stmt)
    assert db_template.name == payload["name"]


async def test_create_template_with_character_limitations(api_client, mock_authenticated_user, test_db_session):
    payload = {
        "binpb": b64encode(Reaction(reaction_id=fake.uuid4()).SerializeToString()).decode(),
        "name": fake.pystr(min_chars=MAX_CRITICAL_FIELD_LENGTH, max_chars=MAX_CRITICAL_FIELD_LENGTH * 2),
        "variables": {"foo": "bar"},
    }
    response = api_client.post("/api/v1/templates", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
