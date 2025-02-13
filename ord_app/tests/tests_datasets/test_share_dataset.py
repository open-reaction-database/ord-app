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

from ord_app.service_api.models import GroupModel, UserGroupsMembershipModel, UserModel
from ord_app.tests.conftest import create_test_dataset

fake = Faker()


async def _create_test_user_with_group(test_db_session):
    user = UserModel(email=fake.email(), external_id=str(fake.uuid4()), auth0_id=str(fake.uuid4()))
    group = GroupModel(name=fake.word(), owner=user)
    group_member = UserGroupsMembershipModel(
        user=user,
        group=group,
        role="admin"
    )
    test_db_session.add_all([user, group, group_member])
    await test_db_session.commit()
    await test_db_session.refresh(user)
    return user, group


async def test_share_and_unshare_dataset(api_client, mock_authenticated_user, test_db_session):
    master_user, set_user_auth, master_group = mock_authenticated_user
    master_dataset = await create_test_dataset(test_db_session, mock_authenticated_user)

    # get the master dataset, there is should be one which is created above
    master_group_datasets = api_client.get(f"/api/v1/groups/{master_group.id}/datasets").raise_for_status().json()
    assert master_group_datasets["total"] == 1
    assert master_group_datasets["items"][0]["id"] == master_dataset.id

    # can the current user share the dataset?
    master_user_dataset = api_client.get(f"/api/v1/datasets/{master_dataset.id}").raise_for_status().json()
    assert master_dataset.id == master_user_dataset["id"]
    assert True is master_user_dataset["is_sharable"]

    # slave user should have 0 datasets
    slave_user, slave_group = await _create_test_user_with_group(test_db_session)
    set_user_auth(slave_user)
    master_group_datasets = api_client.get(f"/api/v1/groups/{slave_group.id}/datasets").raise_for_status().json()
    assert master_group_datasets["total"] == 0

    # share master dataset by master user to the slave user
    set_user_auth(master_user)
    share_response_data = api_client.post(
        f"/api/v1/groups/{master_group.id}/datasets/{master_dataset.id}/share",
        json={"slave_group_id": slave_group.id}
    ).raise_for_status().json()
    assert share_response_data == {"dataset_id": master_dataset.id, "group_id": slave_group.id}

    # now slave user should have 1 dataset with the master id
    set_user_auth(slave_user)
    slave_group_datasets = api_client.get(f"/api/v1/groups/{slave_group.id}/datasets").raise_for_status().json()
    assert slave_group_datasets["total"] == 1
    assert slave_group_datasets["items"][0]["id"] == master_dataset.id

    # And slave user cannot share that dataset
    foreign_user, foreign_group = await _create_test_user_with_group(test_db_session)
    slave_user_dataset = api_client.get(f"/api/v1/datasets/{master_dataset.id}").raise_for_status().json()
    assert master_dataset.id == slave_user_dataset["id"]
    assert False is slave_user_dataset["is_sharable"]
    slave_share_response = api_client.post(
        f"/api/v1/groups/{master_group.id}/datasets/{master_dataset.id}/share",
        json={"slave_group_id": foreign_group.id}
    )
    assert status.HTTP_403_FORBIDDEN == slave_share_response.status_code
    slave_share_response = api_client.post(
        f"/api/v1/groups/{slave_group.id}/datasets/{master_dataset.id}/share",
        json={"slave_group_id": foreign_group.id}
    )
    assert status.HTTP_403_FORBIDDEN == slave_share_response.status_code

    # But he can update master dataset
    payload = {"name": "updated name", "description": "updated description"}
    response_data = api_client.patch(f"/api/v1/datasets/{master_dataset.id}", json=payload).raise_for_status().json()
    assert response_data["name"] == payload["name"]
    assert response_data["description"] == payload["description"]

    # check if the dataset is not duplicated
    set_user_auth(master_user)
    master_group_datasets = api_client.get(f"/api/v1/groups/{master_group.id}/datasets").raise_for_status().json()
    assert master_group_datasets["total"] == 1
    assert master_group_datasets["items"][0]["id"] == master_dataset.id

    # unshare dataset from the slave user
    api_client.post(
        f"/api/v1/groups/{master_group.id}/datasets/{master_dataset.id}/unshare",
        json={"slave_group_id": slave_group.id}
    ).raise_for_status()

    # check how many datasets slave user has now
    set_user_auth(slave_user)
    slave_group_datasets = api_client.get(f"/api/v1/groups/{slave_group.id}/datasets").raise_for_status().json()
    assert slave_group_datasets["total"] == 0
    slave_user_response = api_client.get(f"/api/v1/datasets/{master_dataset.id}")
    assert status.HTTP_403_FORBIDDEN == slave_user_response.status_code
