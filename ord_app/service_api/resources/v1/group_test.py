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
from faker import Faker
from fastapi import status

from ord_app.conftest import create_test_user_with_group
from ord_app.service_api.schemas.base import MAX_CRITICAL_FIELD_LENGTH

faker = Faker()


async def test_add_group_member(api_client, mock_authenticated_user, test_db_session):
    *_, group = mock_authenticated_user
    extra_user, _ = await create_test_user_with_group(test_db_session)

    payload = {"identity": extra_user.email, "role": "admin"}
    response_data = api_client.post(
        f"/api/v1/groups/{group.id}/members",
        json=payload,
    )
    assert response_data.status_code == status.HTTP_201_CREATED

    payload = {"identity": extra_user.email, "role": "admin"}
    response_data = api_client.post(
        f"/api/v1/groups/{group.id}/members",
        json=payload,
    )

    assert response_data.status_code == status.HTTP_409_CONFLICT

    payload = {"identity": "", "role": "admin"}
    response_data = api_client.post(
        f"/api/v1/groups/{group.id}/members",
        json=payload,
    )
    assert response_data.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


async def test_create_group(api_client, mock_authenticated_user):
    payload = {"name": faker.company()}
    response_data = (
        api_client.post("/api/v1/groups", json=payload).raise_for_status().json()
    )
    assert payload["name"] == response_data["name"]
    # The creator is the group's admin; the response includes their role. (#569)
    assert response_data["role"] == "admin"


async def test_create_group_with_character_limitations(
    api_client, mock_authenticated_user
):
    payload = {
        "name": faker.pystr(
            min_chars=MAX_CRITICAL_FIELD_LENGTH + 1,
            max_chars=MAX_CRITICAL_FIELD_LENGTH * 2,
        )
    }
    response = api_client.post("/api/v1/groups", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


async def test_get_group_members(api_client, mock_authenticated_user):
    user, _, group = mock_authenticated_user

    response_data = (
        api_client.get(f"/api/v1/groups/{group.id}/members")
        .raise_for_status()
        .json()[0]
    )

    assert response_data["user"]["id"] == user.id
    assert response_data["role"] == "admin"


async def test_get_group_returns_role(api_client, mock_authenticated_user):
    # GET /groups/{id} returns the current user's role for the group. (#569)
    *_, group = mock_authenticated_user
    response_data = (
        api_client.get(f"/api/v1/groups/{group.id}").raise_for_status().json()
    )
    assert response_data["id"] == group.id
    assert response_data["name"] == group.name
    assert response_data["role"] == "admin"


async def test_list_current_user_groups(api_client, mock_authenticated_user):
    *_, group = mock_authenticated_user

    response_data = api_client.get("/api/v1/groups").raise_for_status().json()[0]

    assert response_data["id"] == group.id
    assert response_data["name"] == group.name
    assert response_data["role"] == "admin"


async def test_get_group(api_client, mock_authenticated_user):
    *_, group = mock_authenticated_user

    response_data = (
        api_client.get(f"/api/v1/groups/{group.id}").raise_for_status().json()
    )

    assert response_data["id"] == group.id
    assert response_data["name"] == group.name


async def test_update_group(api_client, mock_authenticated_user):
    *_, group = mock_authenticated_user
    payload = {"name": faker.company()}
    response_data = (
        api_client.patch(f"/api/v1/groups/{group.id}", json=payload)
        .raise_for_status()
        .json()
    )
    assert payload["name"] == response_data["name"]
    assert response_data["role"] == "admin"  # (#569)
