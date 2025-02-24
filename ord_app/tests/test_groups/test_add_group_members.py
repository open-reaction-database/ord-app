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
from fastapi import status

from ord_app.tests.conftest import create_test_user_with_group


async def test_add_group_member(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user
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
