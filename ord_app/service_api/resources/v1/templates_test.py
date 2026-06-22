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
from datetime import datetime, timedelta

from faker import Faker
from fastapi import status
from ord_schema.proto.reaction_pb2 import Reaction
from sqlalchemy import select

from ord_app.conftest import create_template, create_test_user_with_group
from ord_app.service_api.models import TemplateModel
from ord_app.service_api.schemas.base import MAX_CRITICAL_FIELD_LENGTH

fake = Faker()


async def test_create_template(api_client, mock_authenticated_user, test_db_session):
    payload = {
        "binpb": b64encode(
            Reaction(reaction_id=fake.uuid4()).SerializeToString()
        ).decode(),
        "name": fake.name(),
        "variables": {"foo": "bar"},
    }
    response_data = (
        api_client.post("/api/v1/templates", json=payload).raise_for_status().json()
    )

    stmt = select(TemplateModel).where(TemplateModel.id == response_data["id"])
    db_template = await test_db_session.scalar(stmt)
    assert db_template.name == payload["name"]


async def test_create_template_with_character_limitations(
    api_client, mock_authenticated_user, test_db_session
):
    payload = {
        "binpb": b64encode(
            Reaction(reaction_id=fake.uuid4()).SerializeToString()
        ).decode(),
        "name": fake.pystr(
            min_chars=MAX_CRITICAL_FIELD_LENGTH + 1,
            max_chars=MAX_CRITICAL_FIELD_LENGTH * 2,
        ),
        "variables": {"foo": "bar"},
    }
    response = api_client.post("/api/v1/templates", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


async def test_delete_template(api_client, mock_authenticated_user, test_db_session):
    (
        user,
        *_,
    ) = mock_authenticated_user
    template = await create_template(test_db_session, user.id)
    api_client.delete(f"/api/v1/templates/{template.id}").raise_for_status()

    stmt = select(TemplateModel).where(TemplateModel.id == template.id)
    result = await test_db_session.scalar(stmt)
    assert result is None


async def test_delete_foreign_template(
    api_client, mock_authenticated_user, test_db_session
):
    (
        user,
        *_,
    ) = mock_authenticated_user
    user2, _ = await create_test_user_with_group(test_db_session)
    template = await create_template(test_db_session, user.id)
    template2 = await create_template(test_db_session, user2.id)

    response = api_client.delete(f"/api/v1/templates/{template2.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND

    stmt = select(TemplateModel).where(TemplateModel.id == template.id)
    result = await test_db_session.scalar(stmt)
    assert result.id == template.id


async def test_delete_non_existent_template(api_client, mock_authenticated_user):
    response = api_client.delete("/api/v1/templates/100500")
    assert response.status_code == status.HTTP_404_NOT_FOUND


async def test_get_all_user_templates(
    api_client, mock_authenticated_user, test_db_session
):
    (
        user,
        *_,
    ) = mock_authenticated_user
    user2, _ = await create_test_user_with_group(test_db_session)
    template = await create_template(test_db_session, user.id)
    await create_template(test_db_session, user2.id)

    response_data = api_client.get("/api/v1/templates").raise_for_status().json()
    assert len(response_data) == 1
    assert response_data[0]["id"] == template.id
    assert response_data[0]["molblocks"] == {
        "inputs": {},
        "outcomes": [],
        "workups": [],
    }


async def test_get_template(api_client, mock_authenticated_user, test_db_session):
    (
        user,
        *_,
    ) = mock_authenticated_user
    template = await create_template(test_db_session, user.id)

    response_data = (
        api_client.get(f"/api/v1/templates/{template.id}").raise_for_status().json()
    )
    assert response_data["id"] == template.id
    # The server-managed last-modified timestamp must be serialized and match the stored value (#619).
    returned_modified_at = datetime.fromisoformat(response_data["modified_at"])
    if returned_modified_at.tzinfo and not template.modified_at.tzinfo:
        returned_modified_at = returned_modified_at.replace(tzinfo=None)
    assert abs(returned_modified_at - template.modified_at) < timedelta(seconds=1)


async def test_get_foreign_template(
    api_client, mock_authenticated_user, test_db_session
):
    (
        user,
        *_,
    ) = mock_authenticated_user
    user2, _ = await create_test_user_with_group(test_db_session)
    await create_template(test_db_session, user.id)
    template2 = await create_template(test_db_session, user2.id)

    assert (
        api_client.get(f"/api/v1/templates/{template2.id}").status_code
        == status.HTTP_404_NOT_FOUND
    )


async def test_get_non_existent_template(api_client, mock_authenticated_user):
    assert (
        api_client.get("/api/v1/templates/100500").status_code
        == status.HTTP_404_NOT_FOUND
    )


async def test_update_templates(api_client, mock_authenticated_user, test_db_session):
    (
        user,
        *_,
    ) = mock_authenticated_user
    template = await create_template(test_db_session, user.id)

    payload = {
        "binpb": b64encode(
            Reaction(reaction_id=fake.name()).SerializeToString()
        ).decode(),
        "name": fake.name(),
        "variables": fake.json(),
    }
    response_data = (
        api_client.patch(f"/api/v1/templates/{template.id}", json=payload)
        .raise_for_status()
        .json()
    )
    assert response_data["name"] == payload["name"]


async def test_update_foreign_template(
    api_client, mock_authenticated_user, test_db_session
):
    (
        user,
        *_,
    ) = mock_authenticated_user
    user2, _ = await create_test_user_with_group(test_db_session)
    await create_template(test_db_session, user.id)
    template2 = await create_template(test_db_session, user2.id)

    payload = {
        "binpb": b64encode(
            Reaction(reaction_id=fake.name()).SerializeToString()
        ).decode(),
        "name": fake.name(),
        "variables": fake.json(),
    }
    response = api_client.patch(f"/api/v1/templates/{template2.id}", json=payload)
    assert response.status_code == status.HTTP_404_NOT_FOUND


async def test_update_non_existent_template(
    api_client, mock_authenticated_user, test_db_session
):
    payload = {
        "binpb": b64encode(
            Reaction(reaction_id=fake.name()).SerializeToString()
        ).decode(),
        "name": fake.name(),
        "variables": fake.json(),
    }
    response = api_client.patch("/api/v1/templates/100500", json=payload)
    assert response.status_code == status.HTTP_404_NOT_FOUND
