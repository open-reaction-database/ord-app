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

from ord_app.service_api.models import UserGroupsMembershipModel, UserModel
from ord_app.tests.conftest import create_test_dataset

fake = Faker()


async def test_update_dataset(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)

    payload = {"name": "updated name", "description": "updated description"}
    response_data = api_client.patch(f"/api/v1/datasets/{dataset.id}", json=payload).raise_for_status().json()

    assert response_data["name"] == payload["name"]
    assert response_data["description"] == payload["description"]

    assert response_data["owner"]["id"] == user.id
    assert response_data["owner"]["external_id"] == user.external_id


async def test_viewer_update_dataset(api_client, mock_authenticated_user, test_db_session):
    _, set_user_auth, group = mock_authenticated_user
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    user_viewer = UserModel(email=fake.email(), external_id=str(fake.uuid4()), auth0_id=str(fake.uuid4()))
    group_member = UserGroupsMembershipModel(
        user=user_viewer,
        group=group,
        role="viewer",
    )
    test_db_session.add_all([user_viewer, group, group_member])
    await test_db_session.commit()
    await test_db_session.refresh(user_viewer)
    set_user_auth(user_viewer)

    payload = {"name": "updated name", "description": "updated description"}
    response = api_client.patch(f"/api/v1/datasets/{dataset.id}", json=payload)
    assert response.status_code == status.HTTP_403_FORBIDDEN
