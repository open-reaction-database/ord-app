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

from ord_app.tests.conftest import create_test_user_with_group

fake = Faker()


async def test_update_user(api_client, mock_authenticated_user):
    user, *_, = mock_authenticated_user

    payload = {"email": fake.email(), "orcid_id": fake.uuid4()}
    response_data = api_client.patch(f"/api/v1/users/{user.id}", json=payload).raise_for_status().json()

    assert response_data["email"] == payload["email"]
    assert response_data["orcid_id"] == payload["orcid_id"]


async def test_update_foreign_user(api_client, mock_authenticated_user):
    _ = mock_authenticated_user

    payload = {"email": fake.email(), "orcid_id": fake.uuid4()}
    response = api_client.patch("/api/v1/users/100", json=payload)
    assert response.status_code == status.HTTP_403_FORBIDDEN


async def test_update_duplicated_data(api_client, mock_authenticated_user, test_db_session):
    user, *_, = mock_authenticated_user
    user2, _ = await create_test_user_with_group(test_db_session)

    payload = {"email": user2.email}
    response = api_client.patch(f"/api/v1/users/{user.id}", json=payload)
    assert response.status_code == status.HTTP_409_CONFLICT

    payload = {"orcid_id": user2.orcid_id}
    response = api_client.patch(f"/api/v1/users/{user.id}", json=payload)
    assert response.status_code == status.HTTP_409_CONFLICT
