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
import json
from datetime import datetime

from faker import Faker
from fastapi import status

from ord_app.service_api.models import DatasetGroupAssociationModel, DatasetModel, ReactionModel
from ord_app.tests.conftest import create_test_dataset

faker = Faker()


async def test_paginate_group_datasets(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user

    total_datasets = 10
    datasets = [
        DatasetGroupAssociationModel(dataset=DatasetModel(owner=user, name=faker.uuid4()), group=group)
        for _ in range(total_datasets)
    ]
    test_db_session.add_all(datasets)
    await test_db_session.commit()

    response_data = api_client.get(f"/api/v1/groups/{group.id}/datasets").raise_for_status().json()

    assert response_data["total"] == total_datasets
    assert len(response_data["items"]) == total_datasets

    for dataset in response_data["items"]:
        assert dataset["owner"]["id"] == user.id


async def test_paginate_user_datasets(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user

    total_datasets = total_reactions = 5
    items = []
    for _ in range(total_datasets):
        dataset = DatasetModel(owner=user, name=faker.uuid4())
        items.append(DatasetGroupAssociationModel(dataset=dataset, group=group))

        for _ in range(total_reactions):
            items.append(ReactionModel(pb_reaction_id=faker.uuid4(), dataset=dataset, owner=user))

    test_db_session.add_all(items)
    await test_db_session.commit()

    response_data = api_client.get("/api/v1/datasets").raise_for_status().json()

    assert response_data["total"] == total_datasets
    assert len(response_data["items"]) == total_datasets

    for dataset in response_data["items"]:
        assert dataset["owner"]["id"] == user.id


async def test_get_dataset(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    response_data = api_client.get(f"/api/v1/datasets/{dataset.id}").raise_for_status().json()

    assert response_data["id"] == dataset.id
    assert response_data["reactions_count"] == {"invalid": 0, "none": 0, "total": 0, "valid": 0}


async def test_get_dataset_by_long_id(api_client, mock_authenticated_user, test_db_session):
    response_data = api_client.get("/api/v1/datasets/1234567891011")
    assert response_data.status_code == status.HTTP_400_BAD_REQUEST


async def test_download_dataset(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    response = api_client.get(f"/api/v1/datasets/{dataset.id}/download?file_format=json").raise_for_status()

    response_data = json.loads(response.content)
    assert response_data["name"] == dataset.name


async def test_order_datasets(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user

    dataset1 = DatasetModel(owner=user, name="first dataset")
    dataset2 = DatasetModel(owner=user, name="second dataset")
    test_db_session.add(dataset1)
    await test_db_session.commit()

    test_db_session.add(dataset2)
    await test_db_session.commit()

    test_db_session.add_all([
        DatasetGroupAssociationModel(dataset=dataset1, group=group),
        DatasetGroupAssociationModel(dataset=dataset2, group=group)
    ])
    await test_db_session.commit()
    await test_db_session.flush()

    response_data = api_client.get("/api/v1/datasets").raise_for_status().json()

    assert (
        datetime.strptime(response_data["items"][0]["modified_at"], '%Y-%m-%dT%H:%M:%S.%f')
        >
        datetime.strptime(response_data["items"][1]["modified_at"], '%Y-%m-%dT%H:%M:%S.%f')
    )
