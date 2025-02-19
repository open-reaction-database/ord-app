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

from ord_app.tests.conftest import create_test_dataset, create_test_user_with_group

fake = Faker()


async def test_share_and_unshare_dataset(api_client, mock_authenticated_user, test_db_session):
    primary_user, set_user_auth, primary_group = mock_authenticated_user
    primary_dataset = await create_test_dataset(test_db_session, mock_authenticated_user)

    # get the primary dataset, there is should be one which is created above
    primary_group_datasets = api_client.get(f"/api/v1/groups/{primary_group.id}/datasets").raise_for_status().json()
    assert primary_group_datasets["total"] == 1
    assert primary_group_datasets["items"][0]["id"] == primary_dataset.id

    # can the current user share the dataset?
    primary_user_dataset = api_client.get(f"/api/v1/datasets/{primary_dataset.id}").raise_for_status().json()
    assert primary_dataset.id == primary_user_dataset["id"]
    assert True is primary_user_dataset["is_sharable"]

    # secondary user should have 0 datasets
    secondary_user, secondary_group = await create_test_user_with_group(test_db_session)
    set_user_auth(secondary_user)
    primary_group_datasets = api_client.get(f"/api/v1/groups/{secondary_group.id}/datasets").raise_for_status().json()
    assert primary_group_datasets["total"] == 0

    # share primary dataset by primary user to the secondary user
    set_user_auth(primary_user)
    share_response_data = api_client.post(
        f"/api/v1/groups/{primary_group.id}/datasets/{primary_dataset.id}/share",
        json={"secondary_group_id": secondary_group.id}
    ).raise_for_status().json()
    assert share_response_data == {"dataset_id": primary_dataset.id, "group_id": secondary_group.id}

    # now secondary user should have 1 dataset with the primary id
    set_user_auth(secondary_user)
    secondary_group_datasets = api_client.get(f"/api/v1/groups/{secondary_group.id}/datasets").raise_for_status().json()
    assert secondary_group_datasets["total"] == 1
    assert secondary_group_datasets["items"][0]["id"] == primary_dataset.id

    # And secondary user cannot share that dataset
    foreign_user, foreign_group = await create_test_user_with_group(test_db_session)
    secondary_user_dataset = api_client.get(f"/api/v1/datasets/{primary_dataset.id}").raise_for_status().json()
    assert primary_dataset.id == secondary_user_dataset["id"]
    assert False is secondary_user_dataset["is_sharable"]
    secondary_share_response = api_client.post(
        f"/api/v1/groups/{primary_group.id}/datasets/{primary_dataset.id}/share",
        json={"secondary_group_id": foreign_group.id}
    )
    assert status.HTTP_403_FORBIDDEN == secondary_share_response.status_code
    secondary_share_response = api_client.post(
        f"/api/v1/groups/{secondary_group.id}/datasets/{primary_dataset.id}/share",
        json={"secondary_group_id": foreign_group.id}
    )
    assert status.HTTP_403_FORBIDDEN == secondary_share_response.status_code

    # But he can update primary dataset
    payload = {"name": "updated name", "description": "updated description"}
    response_data = api_client.patch(f"/api/v1/datasets/{primary_dataset.id}", json=payload).raise_for_status().json()
    assert response_data["name"] == payload["name"]
    assert response_data["description"] == payload["description"]

    # check if the dataset is not duplicated
    set_user_auth(primary_user)
    primary_group_datasets = api_client.get(f"/api/v1/groups/{primary_group.id}/datasets").raise_for_status().json()
    assert primary_group_datasets["total"] == 1
    assert primary_group_datasets["items"][0]["id"] == primary_dataset.id

    # unshare dataset from the secondary user
    api_client.post(
        f"/api/v1/groups/{primary_group.id}/datasets/{primary_dataset.id}/unshare",
        json={"secondary_group_id": secondary_group.id}
    ).raise_for_status()

    # check how many datasets secondary user has now
    set_user_auth(secondary_user)
    secondary_group_datasets = api_client.get(f"/api/v1/groups/{secondary_group.id}/datasets").raise_for_status().json()
    assert secondary_group_datasets["total"] == 0
    secondary_user_response = api_client.get(f"/api/v1/datasets/{primary_dataset.id}")
    assert status.HTTP_403_FORBIDDEN == secondary_user_response.status_code
