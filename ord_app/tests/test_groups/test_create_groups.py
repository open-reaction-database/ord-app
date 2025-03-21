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

from ord_app.service_api.schemas.base import MAX_CRITICAL_FIELD_LENGTH

faker = Faker()


async def test_create_group(api_client, mock_authenticated_user):
    user, _, group = mock_authenticated_user
    payload = {"name": faker.company()}
    response_data = api_client.post("/api/v1/groups", json=payload).raise_for_status().json()
    assert payload["name"] == response_data["name"]


async def test_create_group_with_character_limitations(api_client, mock_authenticated_user):
    payload = {"name": faker.pystr(min_chars=MAX_CRITICAL_FIELD_LENGTH, max_chars=MAX_CRITICAL_FIELD_LENGTH * 2)}
    response = api_client.post("/api/v1/groups", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
