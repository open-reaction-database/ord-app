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

from ord_app.tests.conftest import create_template, create_test_user_with_group

fake = Faker()


async def test_get_all_user_templates(api_client, mock_authenticated_user, test_db_session):
    user, *_, = mock_authenticated_user
    user2, _ = await create_test_user_with_group(test_db_session)
    template = await create_template(test_db_session, user.id)
    await create_template(test_db_session, user2.id)

    response_data = api_client.get("/api/v1/templates").raise_for_status().json()
    assert len(response_data) == 1
    assert response_data[0]["id"] == template.id
    assert response_data[0]["molblocks"] == {'inputs': {}, 'outcomes': []}


async def test_get_template(api_client, mock_authenticated_user, test_db_session):
    user, *_, = mock_authenticated_user
    template = await create_template(test_db_session, user.id)

    response_data = api_client.get(f"/api/v1/templates/{template.id}").raise_for_status().json()
    assert response_data["id"] == template.id


async def test_get_foreign_template(api_client, mock_authenticated_user, test_db_session):
    user, *_, = mock_authenticated_user
    user2, _ = await create_test_user_with_group(test_db_session)
    await create_template(test_db_session, user.id)
    template2 = await create_template(test_db_session, user2.id)

    assert api_client.get(f"/api/v1/templates/{template2.id}").status_code == status.HTTP_404_NOT_FOUND


async def test_get_non_existent_template(api_client, mock_authenticated_user):
    assert api_client.get("/api/v1/templates/100500").status_code == status.HTTP_404_NOT_FOUND
