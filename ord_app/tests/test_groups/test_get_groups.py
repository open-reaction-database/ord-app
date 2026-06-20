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


async def test_get_group_members(api_client, mock_authenticated_user):
    user, _, group = mock_authenticated_user

    response_data = api_client.get(f"/api/v1/groups/{group.id}/members").raise_for_status().json()[0]

    assert response_data["user"]["id"] == user.id
    assert response_data["role"] == "admin"


async def test_get_group_returns_role(api_client, mock_authenticated_user):
    # GET /groups/{id} returns the current user's role for the group. (#569)
    *_, group = mock_authenticated_user
    response_data = api_client.get(f"/api/v1/groups/{group.id}").raise_for_status().json()
    assert response_data["id"] == group.id
    assert response_data["name"] == group.name
    assert response_data["role"] == "admin"
