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
from base64 import b64encode
from datetime import datetime
from io import BytesIO

import pytest
from faker import Faker
from fastapi import status
from ord_schema.proto.dataset_pb2 import Dataset
from ord_schema.proto.reaction_pb2 import Reaction
from sqlalchemy import select

from ord_app.conftest import (
    create_test_dataset,
    create_test_user_with_group,
    read_testdata_bytes,
    read_testdata_text,
)
from ord_app.service_api.domain.reactions import validate_dataset_reactions
from ord_app.service_api.models import (
    DatasetGroupAssociationModel,
    DatasetModel,
    ReactionModel,
    UserGroupsMembershipModel,
    UserModel,
)
from ord_app.service_api.schemas.base import MAX_CRITICAL_FIELD_LENGTH, MAX_FIELD_LENGTH
from ord_app.service_api.services.pb_utils import (
    load_dataset_message,
    write_dataset_message,
)

fake = Faker()
# Both names are used across the test functions merged into this file; alias rather than
# instantiate a second Faker.
faker = fake


def parse_dt(dt):
    return datetime.strptime(dt, "%Y-%m-%dT%H:%M:%S.%f")


async def test_dataset_modified_at(api_client, mock_authenticated_user):
    *_, group = mock_authenticated_user

    payload = {"name": fake.company(), "description": fake.text(5)}
    resp1 = (
        api_client.post(f"/api/v1/groups/{group.id}/datasets", json=payload)
        .raise_for_status()
        .json()
    )
    dataset_id = resp1["id"]

    resp2 = (
        api_client.patch(f"/api/v1/datasets/{dataset_id}", json=payload)
        .raise_for_status()
        .json()
    )
    assert parse_dt(resp1["modified_at"]) < parse_dt(resp2["modified_at"])

    # create reaction
    payload = {
        "binpb": b64encode(Reaction(reaction_id="test").SerializeToString()).decode()
    }
    reaction_resp = (
        api_client.post(f"/api/v1/datasets/{dataset_id}/reactions", json=payload)
        .raise_for_status()
        .json()
    )
    resp3 = api_client.get(f"/api/v1/datasets/{dataset_id}").raise_for_status().json()
    assert parse_dt(resp2["modified_at"]) < parse_dt(resp3["modified_at"])

    # update reaction
    payload = {
        "binpb": b64encode(Reaction(reaction_id="updated").SerializeToString()).decode()
    }
    api_client.patch(
        f"/api/v1/datasets/{dataset_id}/reactions/{reaction_resp['id']}", json=payload
    ).raise_for_status().json()
    resp4 = api_client.get(f"/api/v1/datasets/{dataset_id}").raise_for_status().json()
    assert parse_dt(resp3["modified_at"]) < parse_dt(resp4["modified_at"])


async def test_create_dataset(api_client, mock_authenticated_user):
    user, _, group = mock_authenticated_user

    payload = {"name": faker.name(), "description": faker.text(max_nb_chars=20)}
    response_data = (
        api_client.post(f"/api/v1/groups/{group.id}/datasets", json=payload)
        .raise_for_status()
        .json()
    )

    assert response_data["name"] == payload["name"]
    assert response_data["description"] == payload["description"]
    assert response_data["groups"] == [
        {"id": group.id, "role": "admin", "name": group.name}
    ]

    assert response_data["owner"]["id"] == user.id
    assert response_data["owner"]["external_id"] == user.external_id


async def test_create_dataset_with_generating_name(api_client, mock_authenticated_user):
    *_, group = mock_authenticated_user
    response_data = (
        api_client.post(f"/api/v1/groups/{group.id}/datasets", json={"name": ""})
        .raise_for_status()
        .json()
    )
    assert response_data["name"] != ""

    response_data = (
        api_client.post(f"/api/v1/groups/{group.id}/datasets", json={"name": " "})
        .raise_for_status()
        .json()
    )
    assert response_data["name"] != " "

    payload = {"name": f" {faker.name()} "}
    response_data = (
        api_client.post(f"/api/v1/groups/{group.id}/datasets", json=payload)
        .raise_for_status()
        .json()
    )
    assert response_data["name"] == payload["name"].strip()


@pytest.mark.parametrize(
    "kind,filename,expected_name",
    (
        ("txtpb", "empty.txtpb", "empty"),
        ("txtpb", "full.txtpb", "full"),
        ("txtpb", "reaction_duplication.txtpb", "empty"),
    ),
)
async def test_upload_dataset(
    kind, filename, expected_name, api_client, mock_authenticated_user
):
    user, _, group = mock_authenticated_user

    response_data = (
        api_client.post(
            f"/api/v1/groups/{group.id}/datasets/upload",
            files={"file": (filename, read_testdata_text(filename))},
        )
        .raise_for_status()
        .json()
    )
    assert response_data["name"] == expected_name
    assert response_data["owner"]["id"] == user.id
    assert response_data["groups"] == [
        {"id": group.id, "role": "admin", "name": group.name}
    ]


async def test_upload_dataset_with_reaction_validation(
    api_client, mock_authenticated_user, test_db_session
):
    user, _, group = mock_authenticated_user

    response_data = (
        api_client.post(
            f"/api/v1/groups/{group.id}/datasets/upload",
            files={
                "file": (
                    "ord-nielsen-example.txtpb",
                    read_testdata_bytes("ord-nielsen-example.txtpb"),
                )
            },
        )
        .raise_for_status()
        .json()
    )

    response_data["name"] = "Deoxyfluorination screen"
    response_data["owner"]["id"] = user.id

    stmt = select(ReactionModel.is_valid).where(
        ReactionModel.dataset_id == response_data["id"]
    )
    await validate_dataset_reactions(test_db_session)
    assert {
        True,
    } == set((await test_db_session.scalars(stmt)).all())


async def test_upload_wrong_file_extension(api_client, mock_authenticated_user):
    *_, group = mock_authenticated_user

    response_data = api_client.post(
        f"/api/v1/groups/{group.id}/datasets/upload",
        files={"file": ("wrong.pdf", BytesIO(b"pdf"))},
    )
    assert response_data.status_code == status.HTTP_400_BAD_REQUEST


async def test_upload_wrong_file(api_client, mock_authenticated_user):
    *_, group = mock_authenticated_user

    response_data = api_client.post(
        f"/api/v1/groups/{group.id}/datasets/upload",
        files={"file": ("wrongfile.pb", BytesIO(b"pdf"))},
    )
    assert response_data.status_code == status.HTTP_400_BAD_REQUEST


async def test_dataset_extend(api_client, mock_authenticated_user, test_db_session):
    user, *_ = mock_authenticated_user
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    reaction_id = faker.uuid4()
    reaction = ReactionModel(
        owner=user,
        pb_reaction_id=reaction_id,
        dataset=dataset,
        binpb=Reaction(reaction_id=reaction_id).SerializeToString(),
    )
    test_db_session.add(reaction)
    await test_db_session.commit()

    response_data = (
        api_client.get(f"/api/v1/datasets/{dataset.id}/reactions")
        .raise_for_status()
        .json()
    )
    assert len(response_data["items"]) == 1
    assert response_data["items"][0]["pb_reaction_id"] == reaction_id

    enum_reaction_id = faker.uuid4()
    enum_dataset_pb = Dataset(reactions=[Reaction(reaction_id=enum_reaction_id)])
    response_data = api_client.post(
        f"/api/v1/datasets/{dataset.id}/extend",
        files={"file": ("dataset.binpb", enum_dataset_pb.SerializeToString())},
    )
    assert response_data.status_code == status.HTTP_200_OK

    response_data = (
        api_client.get(f"/api/v1/datasets/{dataset.id}/reactions")
        .raise_for_status()
        .json()
    )
    assert len(response_data["items"]) == 2

    for item in response_data["items"]:
        assert item["pb_reaction_id"] in (reaction_id, enum_reaction_id)


async def test_create_dataset_with_character_limitations(
    api_client, mock_authenticated_user
):
    *_, group = mock_authenticated_user
    payload = {
        "name": faker.pystr(
            min_chars=MAX_CRITICAL_FIELD_LENGTH + 1,
            max_chars=MAX_CRITICAL_FIELD_LENGTH * 2,
        ),
        "description": faker.pystr(
            min_chars=MAX_FIELD_LENGTH + 1, max_chars=MAX_FIELD_LENGTH * 2
        ),
    }
    response = api_client.post(f"/api/v1/groups/{group.id}/datasets", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


async def test_delete_dataset(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user

    test_db_session.add(
        DatasetGroupAssociationModel(
            dataset=DatasetModel(owner=user, name="init", description="init"),
            group=group,
        )
    )
    await test_db_session.commit()

    response_data = (
        api_client.get(f"/api/v1/groups/{group.id}/datasets").raise_for_status().json()
    )
    assert len(response_data["items"]) == 1

    api_client.delete(
        f"/api/v1/datasets/{response_data['items'][0]['id']}"
    ).raise_for_status().json()

    response_data = (
        api_client.get(f"/api/v1/groups/{group.id}/datasets").raise_for_status().json()
    )
    assert response_data["items"] == []


async def test_create_enumerate_dataset(
    api_client, mock_authenticated_user, test_db_session
):
    *_, group = mock_authenticated_user
    payload = {
        "name": faker.name(),
        "description": faker.text(),
        "reactions": [
            b64encode(Reaction(reaction_id=faker.uuid4()).SerializeToString()).decode(),
            b64encode(Reaction(reaction_id=faker.uuid4()).SerializeToString()).decode(),
        ],
    }

    dataset = (
        api_client.post(
            f"/api/v1/groups/{group.id}/datasets/enumerate",
            json=payload,
        )
        .raise_for_status()
        .json()
    )
    response_data = (
        api_client.get(f"/api/v1/datasets/{dataset['id']}").raise_for_status().json()
    )
    assert response_data["name"] == payload["name"]
    assert response_data["description"] == payload["description"]
    assert response_data["reactions_count"]["total"] == len(payload["reactions"])
    assert response_data["groups"] == [
        {"id": group.id, "role": "admin", "name": group.name}
    ]

    response_data = (
        api_client.get(f"/api/v1/datasets/{dataset['id']}/reactions")
        .raise_for_status()
        .json()
    )
    assert response_data["total"] == len(payload["reactions"])

    payload = {
        "reactions": [
            b64encode(Reaction(reaction_id=faker.uuid4()).SerializeToString()).decode(),
            b64encode(Reaction(reaction_id=faker.uuid4()).SerializeToString()).decode(),
        ]
    }
    api_client.post(
        f"/api/v1/datasets/{dataset['id']}/enumerate/extend",
        json=payload,
    )

    response_data = (
        api_client.get(f"/api/v1/datasets/{dataset['id']}/reactions")
        .raise_for_status()
        .json()
    )
    assert response_data["total"] == 4


async def test_get_dataset_groups(api_client, mock_authenticated_user, test_db_session):
    *_, primary_group = mock_authenticated_user
    primary_dataset = await create_test_dataset(
        test_db_session, mock_authenticated_user
    )

    # share primary dataset by primary user to the secondary user
    _, secondary_group = await create_test_user_with_group(test_db_session)
    share_response_data = (
        api_client.post(
            f"/api/v1/groups/{primary_group.id}/datasets/{primary_dataset.id}/share",
            json={"secondary_group_id": secondary_group.id},
        )
        .raise_for_status()
        .json()
    )
    assert share_response_data == {
        "dataset_id": primary_dataset.id,
        "group_id": secondary_group.id,
    }

    response_data = (
        api_client.get(f"/api/v1/datasets/{primary_dataset.id}/groups")
        .raise_for_status()
        .json()
    )
    assert response_data[0]["id"] == primary_group.id
    assert response_data[0]["is_primary"] is True

    assert response_data[1]["id"] == secondary_group.id
    assert response_data[1]["is_primary"] is False


async def test_paginate_group_datasets(
    api_client, mock_authenticated_user, test_db_session
):
    user, _, group = mock_authenticated_user

    total_datasets = 10
    datasets = [
        DatasetGroupAssociationModel(
            dataset=DatasetModel(owner=user, name=faker.uuid4()), group=group
        )
        for _ in range(total_datasets)
    ]
    test_db_session.add_all(datasets)
    await test_db_session.commit()

    response_data = (
        api_client.get(f"/api/v1/groups/{group.id}/datasets").raise_for_status().json()
    )

    assert response_data["total"] == total_datasets
    assert len(response_data["items"]) == total_datasets

    for dataset in response_data["items"]:
        assert dataset["owner"]["id"] == user.id


async def test_paginate_user_datasets(
    api_client, mock_authenticated_user, test_db_session
):
    user, _, group = mock_authenticated_user

    total_datasets = total_reactions = 5
    items = []
    for _ in range(total_datasets):
        dataset = DatasetModel(owner=user, name=faker.uuid4())
        items.append(DatasetGroupAssociationModel(dataset=dataset, group=group))

        for _ in range(total_reactions):
            items.append(
                ReactionModel(pb_reaction_id=faker.uuid4(), dataset=dataset, owner=user)
            )

    test_db_session.add_all(items)
    await test_db_session.commit()

    response_data = api_client.get("/api/v1/datasets").raise_for_status().json()

    assert response_data["total"] == total_datasets
    assert len(response_data["items"]) == total_datasets

    for dataset in response_data["items"]:
        assert dataset["owner"]["id"] == user.id


async def test_get_dataset(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    response_data = (
        api_client.get(f"/api/v1/datasets/{dataset.id}").raise_for_status().json()
    )

    assert response_data["id"] == dataset.id
    assert response_data["reactions_count"] == {
        "invalid": 0,
        "none": 0,
        "total": 0,
        "valid": 0,
    }


async def test_get_dataset_by_long_id(
    api_client, mock_authenticated_user, test_db_session
):
    response_data = api_client.get("/api/v1/datasets/1234567891011")
    assert response_data.status_code == status.HTTP_400_BAD_REQUEST


async def test_get_nonexistent_dataset_returns_404(
    api_client, mock_authenticated_user, test_db_session
):
    # A dataset that doesn't exist is indistinguishable from one the user can't access: 404, not 403,
    # so we never leak whether the dataset exists. (#446)
    response = api_client.get("/api/v1/datasets/999999")
    assert response.status_code == status.HTTP_404_NOT_FOUND


async def test_get_dataset_without_membership_returns_404(
    api_client, mock_authenticated_user, test_db_session
):
    # A user with no membership in any of the dataset's groups gets 404 (not 403) — no existence leak. (#446)
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    _, set_user_auth, _ = mock_authenticated_user
    outsider = UserModel(
        email=faker.email(), external_id=str(faker.uuid4()), auth0_id=str(faker.uuid4())
    )
    test_db_session.add(outsider)
    await test_db_session.commit()
    await test_db_session.refresh(outsider)
    set_user_auth(outsider)

    response = api_client.get(f"/api/v1/datasets/{dataset.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


async def test_download_dataset(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    response = api_client.get(
        f"/api/v1/datasets/{dataset.id}/download?file_format=json"
    ).raise_for_status()

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

    test_db_session.add_all(
        [
            DatasetGroupAssociationModel(dataset=dataset1, group=group),
            DatasetGroupAssociationModel(dataset=dataset2, group=group),
        ]
    )
    await test_db_session.commit()
    await test_db_session.flush()

    response_data = api_client.get("/api/v1/datasets").raise_for_status().json()

    assert datetime.strptime(
        response_data["items"][0]["modified_at"], "%Y-%m-%dT%H:%M:%S.%f"
    ) > datetime.strptime(
        response_data["items"][1]["modified_at"], "%Y-%m-%dT%H:%M:%S.%f"
    )


async def test_share_and_unshare_dataset(
    api_client, mock_authenticated_user, test_db_session
):
    primary_user, set_user_auth, primary_group = mock_authenticated_user
    primary_dataset = await create_test_dataset(
        test_db_session, mock_authenticated_user
    )

    # get the primary dataset, there is should be one which is created above
    primary_group_datasets = (
        api_client.get(f"/api/v1/groups/{primary_group.id}/datasets")
        .raise_for_status()
        .json()
    )
    assert primary_group_datasets["total"] == 1
    assert primary_group_datasets["items"][0]["id"] == primary_dataset.id

    # can the current user share the dataset?
    primary_user_dataset = (
        api_client.get(f"/api/v1/datasets/{primary_dataset.id}")
        .raise_for_status()
        .json()
    )
    assert primary_dataset.id == primary_user_dataset["id"]
    assert True is primary_user_dataset["is_sharable"]

    # secondary user should have 0 datasets
    secondary_user, secondary_group = await create_test_user_with_group(test_db_session)
    set_user_auth(secondary_user)
    primary_group_datasets = (
        api_client.get(f"/api/v1/groups/{secondary_group.id}/datasets")
        .raise_for_status()
        .json()
    )
    assert primary_group_datasets["total"] == 0

    # share primary dataset by primary user to the secondary user
    set_user_auth(primary_user)
    share_response_data = (
        api_client.post(
            f"/api/v1/groups/{primary_group.id}/datasets/{primary_dataset.id}/share",
            json={"secondary_group_id": secondary_group.id},
        )
        .raise_for_status()
        .json()
    )
    assert share_response_data == {
        "dataset_id": primary_dataset.id,
        "group_id": secondary_group.id,
    }

    # now secondary user should have 1 dataset with the primary id
    set_user_auth(secondary_user)
    secondary_group_datasets = (
        api_client.get(f"/api/v1/groups/{secondary_group.id}/datasets")
        .raise_for_status()
        .json()
    )
    assert secondary_group_datasets["total"] == 1
    assert secondary_group_datasets["items"][0]["id"] == primary_dataset.id

    # And secondary user cannot share that dataset
    _, foreign_group = await create_test_user_with_group(test_db_session)
    secondary_user_dataset = (
        api_client.get(f"/api/v1/datasets/{primary_dataset.id}")
        .raise_for_status()
        .json()
    )
    assert primary_dataset.id == secondary_user_dataset["id"]
    assert False is secondary_user_dataset["is_sharable"]
    secondary_share_response = api_client.post(
        f"/api/v1/groups/{primary_group.id}/datasets/{primary_dataset.id}/share",
        json={"secondary_group_id": foreign_group.id},
    )
    assert secondary_share_response.status_code == status.HTTP_403_FORBIDDEN
    secondary_share_response = api_client.post(
        f"/api/v1/groups/{secondary_group.id}/datasets/{primary_dataset.id}/share",
        json={"secondary_group_id": foreign_group.id},
    )
    assert secondary_share_response.status_code == status.HTTP_403_FORBIDDEN

    # But he can update primary dataset
    payload = {"name": "updated name", "description": "updated description"}
    response_data = (
        api_client.patch(f"/api/v1/datasets/{primary_dataset.id}", json=payload)
        .raise_for_status()
        .json()
    )
    assert response_data["name"] == payload["name"]
    assert response_data["description"] == payload["description"]

    # check if the dataset is not duplicated
    set_user_auth(primary_user)
    primary_group_datasets = (
        api_client.get(f"/api/v1/groups/{primary_group.id}/datasets")
        .raise_for_status()
        .json()
    )
    assert primary_group_datasets["total"] == 1
    assert primary_group_datasets["items"][0]["id"] == primary_dataset.id

    # unshare dataset from the secondary user
    api_client.post(
        f"/api/v1/groups/{primary_group.id}/datasets/{primary_dataset.id}/unshare",
        json={"secondary_group_id": secondary_group.id},
    ).raise_for_status()

    # check how many datasets secondary user has now
    set_user_auth(secondary_user)
    secondary_group_datasets = (
        api_client.get(f"/api/v1/groups/{secondary_group.id}/datasets")
        .raise_for_status()
        .json()
    )
    assert secondary_group_datasets["total"] == 0
    # Having been unshared, the secondary user has lost access: a 404 (not 403) so we don't reveal
    # that the dataset still exists. (#446)
    secondary_user_response = api_client.get(f"/api/v1/datasets/{primary_dataset.id}")
    assert secondary_user_response.status_code == status.HTTP_404_NOT_FOUND


async def test_share_dataset_to_the_same_group(
    api_client, mock_authenticated_user, test_db_session
):
    *_, group = mock_authenticated_user
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)

    response = api_client.post(
        f"/api/v1/groups/{group.id}/datasets/{dataset.id}/share",
        json={"secondary_group_id": group.id},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


async def test_update_dataset(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)

    payload = {"name": "updated name", "description": "updated description"}
    response_data = (
        api_client.patch(f"/api/v1/datasets/{dataset.id}", json=payload)
        .raise_for_status()
        .json()
    )

    assert response_data["name"] == payload["name"]
    assert response_data["description"] == payload["description"]
    assert response_data["groups"] == [
        {"id": group.id, "role": "admin", "name": group.name}
    ]

    assert response_data["owner"]["id"] == user.id
    assert response_data["owner"]["external_id"] == user.external_id


async def test_viewer_update_dataset(
    api_client, mock_authenticated_user, test_db_session
):
    _, set_user_auth, group = mock_authenticated_user
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    user_viewer = UserModel(
        email=fake.email(), external_id=str(fake.uuid4()), auth0_id=str(fake.uuid4())
    )
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


def _parquet_dataset_bytes(name: str, num_reactions: int = 2) -> bytes:
    """Serialize a small valid dataset to Parquet (requires name/description/reactions)."""
    dataset = Dataset(name=name, description="A Parquet dataset")
    dataset.reactions.extend(
        Reaction(reaction_id=faker.uuid4()) for _ in range(num_reactions)
    )
    return write_dataset_message(dataset, "parquet")


async def test_upload_parquet_dataset(api_client, mock_authenticated_user):
    user, _, group = mock_authenticated_user

    response_data = (
        api_client.post(
            f"/api/v1/groups/{group.id}/datasets/upload",
            files={"file": ("screen.parquet", _parquet_dataset_bytes("screen"))},
        )
        .raise_for_status()
        .json()
    )
    assert response_data["name"] == "screen"
    assert response_data["owner"]["id"] == user.id


async def test_upload_malformed_parquet(api_client, mock_authenticated_user):
    *_, group = mock_authenticated_user

    response_data = api_client.post(
        f"/api/v1/groups/{group.id}/datasets/upload",
        files={"file": ("broken.parquet", BytesIO(b"not really parquet"))},
    )
    assert response_data.status_code == status.HTTP_400_BAD_REQUEST


async def _add_reaction(test_db_session, user, dataset):
    reaction_id = faker.uuid4()
    test_db_session.add(
        ReactionModel(
            owner=user,
            pb_reaction_id=reaction_id,
            dataset=dataset,
            binpb=Reaction(reaction_id=reaction_id).SerializeToString(),
        )
    )
    await test_db_session.commit()
    return reaction_id


async def test_download_dataset_as_parquet_round_trips(
    api_client, mock_authenticated_user, test_db_session
):
    user, *_ = mock_authenticated_user
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    dataset.description = "A downloadable dataset"
    reaction_id = await _add_reaction(test_db_session, user, dataset)

    response = api_client.get(
        f"/api/v1/datasets/{dataset.id}/download?file_format=parquet"
    ).raise_for_status()
    assert response.headers["content-disposition"].endswith('.parquet"')

    # The downloaded bytes round-trip back into a Dataset with the same reaction.
    loaded = load_dataset_message(response.content, "parquet")
    assert loaded.name == dataset.name
    assert loaded.description == dataset.description
    assert [r.reaction_id for r in loaded.reactions] == [reaction_id]


@pytest.mark.parametrize("description", (None, "", "   "))
async def test_download_parquet_requires_description(
    description, api_client, mock_authenticated_user, test_db_session
):
    # A missing, empty, or whitespace-only description must reject Parquet export with a clear 422.
    user, *_ = mock_authenticated_user
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    if description is not None:
        dataset.description = description
    await _add_reaction(test_db_session, user, dataset)

    response = api_client.get(
        f"/api/v1/datasets/{dataset.id}/download?file_format=parquet"
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert "description" in response.json()["detail"]
