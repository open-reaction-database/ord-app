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

from ord_app.tests.conftest import create_test_dataset, create_test_user_with_group

faker = Faker()


async def test_get_dataset_groups(api_client, mock_authenticated_user, test_db_session):
    primary_user, set_user_auth, primary_group = mock_authenticated_user
    primary_dataset = await create_test_dataset(test_db_session, mock_authenticated_user)

    # share primary dataset by primary user to the secondary user
    secondary_user, secondary_group = await create_test_user_with_group(test_db_session)
    share_response_data = api_client.post(
        f"/api/v1/groups/{primary_group.id}/datasets/{primary_dataset.id}/share",
        json={"secondary_group_id": secondary_group.id}
    ).raise_for_status().json()
    assert share_response_data == {"dataset_id": primary_dataset.id, "group_id": secondary_group.id}

    response_data = api_client.get(f"/api/v1/datasets/{primary_dataset.id}/groups").raise_for_status().json()
    assert response_data[0]["id"] == primary_group.id
    assert response_data[0]["is_primary"] is True

    assert response_data[1]["id"] == secondary_group.id
    assert response_data[1]["is_primary"] is False
