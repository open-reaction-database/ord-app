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
from base64 import b64decode, b64encode

from faker import Faker
from fastapi import status
from ord_schema.proto.dataset_pb2 import Dataset
from ord_schema.proto.reaction_pb2 import Reaction

from ord_app.conftest import (
    create_test_dataset,
    create_test_reaction,
    read_testdata_bytes,
)
from ord_app.service_api.schemas.base import MAX_CRITICAL_FIELD_LENGTH
from ord_app.service_api.services.pb_utils import load_message

fake = Faker()
# Both names are used across the test functions merged into this file; alias rather than
# instantiate a second Faker.
faker = fake


async def test_create_reaction_with_pb(
    api_client, mock_authenticated_user, test_db_session
):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)

    pb_dataset = load_message(
        read_testdata_bytes("ord-nielsen-example.txtpb"), Dataset, "txtpb"
    )
    pb_reaction = pb_dataset.reactions[0]
    pb_reaction.reaction_id = "test"

    payload = {"binpb": b64encode(pb_reaction.SerializeToString()).decode()}

    response_data = (
        api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload)
        .raise_for_status()
        .json()
    )
    reaction_pb = load_message(b64decode(response_data["binpb"]), Reaction, "binpb")
    assert reaction_pb.reaction_id == response_data["pb_reaction_id"] == "test"
    assert response_data["is_valid"] is True
    assert response_data["validation"] == {"errors": [], "warnings": []}


async def test_upload_reaction(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    pb_reaction = Reaction(reaction_id="test")

    response_data = (
        api_client.post(
            f"/api/v1/datasets/{dataset.id}/reactions/upload",
            files={"file": ("reaction.pb", pb_reaction.SerializeToString())},
        )
        .raise_for_status()
        .json()
    )
    assert response_data["pb_reaction_id"] == pb_reaction.reaction_id


async def test_upload_reaction_with_duplicate_reaction_id(
    api_client, mock_authenticated_user, test_db_session
):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    pb_reaction = Reaction(reaction_id="test")

    response_data = (
        api_client.post(
            f"/api/v1/datasets/{dataset.id}/reactions/upload",
            files={"file": ("reaction.pb", pb_reaction.SerializeToString())},
        )
        .raise_for_status()
        .json()
    )
    assert response_data["pb_reaction_id"] == pb_reaction.reaction_id

    response_data = (
        api_client.post(
            f"/api/v1/datasets/{dataset.id}/reactions/upload",
            files={"file": ("reaction.pb", pb_reaction.SerializeToString())},
        )
        .raise_for_status()
        .json()
    )
    assert response_data["pb_reaction_id"].startswith("duplicate-test")


async def test_create_with_duplicate_reaction_id(
    api_client, mock_authenticated_user, test_db_session
):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    payload = {
        "binpb": b64encode(Reaction(reaction_id="test").SerializeToString()).decode()
    }

    response_data = (
        api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload)
        .raise_for_status()
        .json()
    )
    assert response_data["pb_reaction_id"] == "test"

    response_data = (
        api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload)
        .raise_for_status()
        .json()
    )
    assert response_data["pb_reaction_id"].startswith("duplicate-test")


async def test_create_duplicate_reaction_without_reaction_id(
    api_client, mock_authenticated_user, test_db_session
):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    payload = {"binpb": b64encode(Reaction().SerializeToString()).decode()}

    response_data1 = (
        api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload)
        .raise_for_status()
        .json()
    )
    response_data2 = (
        api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload)
        .raise_for_status()
        .json()
    )
    assert response_data1["id"] != response_data2["id"]
    assert response_data1["pb_reaction_id"] != response_data2["pb_reaction_id"]


async def test_create_reaction_with_character_limitations(
    api_client, mock_authenticated_user, test_db_session
):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    payload = {
        "binpb": b64encode(
            Reaction(
                reaction_id=fake.pystr(
                    min_chars=MAX_CRITICAL_FIELD_LENGTH + 1,
                    max_chars=MAX_CRITICAL_FIELD_LENGTH * 2,
                )
            ).SerializeToString()
        ).decode()
    }

    response = api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


async def test_create_reaction_rejects_oversized_attachments(
    api_client, mock_authenticated_user, test_db_session
):
    # The cumulative attachment cap is enforced on the POST create path too. (#543)
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    pb_reaction = Reaction(reaction_id="test")
    pb_reaction.observations.add().image.bytes_value = b"x" * (10 * 1024 * 1024 + 1)

    payload = {"binpb": b64encode(pb_reaction.SerializeToString()).decode()}
    response = api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert "10 MB" in response.json()["detail"]


async def test_upload_reaction_rejects_oversized_attachments(
    api_client, mock_authenticated_user, test_db_session
):
    # The cumulative attachment cap is enforced on the upload path too. (#543)
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    pb_reaction = Reaction(reaction_id="test")
    pb_reaction.observations.add().image.bytes_value = b"x" * (10 * 1024 * 1024 + 1)

    response = api_client.post(
        f"/api/v1/datasets/{dataset.id}/reactions/upload",
        files={"file": ("reaction.pb", pb_reaction.SerializeToString())},
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert "10 MB" in response.json()["detail"]


async def test_create_reaction_from_scratch(
    api_client, mock_authenticated_user, test_db_session
):
    user, *_ = mock_authenticated_user
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)

    response_data = (
        api_client.post(f"/api/v1/datasets/{dataset.id}/reactions/from-scratch")
        .raise_for_status()
        .json()
    )
    reaction_pb = load_message(b64decode(response_data["binpb"]), Reaction, "binpb")
    assert reaction_pb.reaction_id == response_data["pb_reaction_id"]

    record_event = reaction_pb.provenance.record_created
    person = record_event.person
    assert bool(record_event.time)

    experimenter = reaction_pb.provenance.experimenter
    assert experimenter.username == person.username == user.external_id
    assert experimenter.email == person.email == user.email
    assert experimenter.name == person.name == user.name
    assert experimenter.orcid == person.orcid == user.orcid_id


async def test_delete_reaction(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)

    payload = {
        "binpb": b64encode(Reaction(reaction_id="test").SerializeToString()).decode()
    }
    response_data = (
        api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload)
        .raise_for_status()
        .json()
    )
    reaction_id = response_data["id"]

    response = api_client.delete(
        f"/api/v1/datasets/{dataset.id}/reactions/{reaction_id}"
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT

    response_data = api_client.get(
        f"/api/v1/datasets/{dataset.id}/reactions/{reaction_id}"
    )

    assert response_data.status_code == status.HTTP_404_NOT_FOUND


async def test_paginate_reactions(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    await create_test_reaction(test_db_session, mock_authenticated_user, dataset)

    response_data = (
        api_client.get(f"/api/v1/datasets/{dataset.id}/reactions")
        .raise_for_status()
        .json()
    )
    assert response_data["total"] == 1


async def test_paginate_query_reactions(
    api_client, mock_authenticated_user, test_db_session
):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    reaction_is_valid_none = await create_test_reaction(
        test_db_session, mock_authenticated_user, dataset
    )
    reaction_is_valid_true = await create_test_reaction(
        test_db_session, mock_authenticated_user, dataset, is_valid=True
    )
    reaction_is_valid_false = await create_test_reaction(
        test_db_session, mock_authenticated_user, dataset, is_valid=False
    )

    response_data = (
        api_client.get(f"/api/v1/datasets/{dataset.id}/reactions")
        .raise_for_status()
        .json()
    )
    assert response_data["total"] == 3

    response_data = (
        api_client.get(f"/api/v1/datasets/{dataset.id}/reactions?is_valid=true")
        .raise_for_status()
        .json()
    )
    assert response_data["total"] == 1
    assert response_data["items"][0]["id"] == reaction_is_valid_true.id
    assert response_data["items"][0]["is_valid"] is True

    response_data = (
        api_client.get(f"/api/v1/datasets/{dataset.id}/reactions?is_valid=false")
        .raise_for_status()
        .json()
    )
    assert response_data["total"] == 1
    assert response_data["items"][0]["id"] == reaction_is_valid_false.id
    assert response_data["items"][0]["is_valid"] is False

    response_data = (
        api_client.get(f"/api/v1/datasets/{dataset.id}/reactions?is_valid=null")
        .raise_for_status()
        .json()
    )
    assert response_data["total"] == 1
    assert response_data["items"][0]["id"] == reaction_is_valid_none.id
    assert response_data["items"][0]["is_valid"] is None

    response_data = (
        api_client.get(
            f"/api/v1/datasets/{dataset.id}/reactions?is_valid=false&is_valid=null"
        )
        .raise_for_status()
        .json()
    )
    assert response_data["total"] == 2
    assert response_data["items"][0]["id"] == reaction_is_valid_none.id
    assert response_data["items"][0]["is_valid"] is None
    assert response_data["items"][1]["id"] == reaction_is_valid_false.id
    assert response_data["items"][1]["is_valid"] is False


async def test_get_reaction(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    reaction = await create_test_reaction(
        test_db_session, mock_authenticated_user, dataset
    )

    response_data = (
        api_client.get(f"/api/v1/datasets/{dataset.id}/reactions/{reaction.id}")
        .raise_for_status()
        .json()
    )
    assert response_data["id"] == reaction.id


async def test_search_reaction(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    reaction = await create_test_reaction(
        test_db_session, mock_authenticated_user, dataset
    )

    response_data = (
        api_client.get(
            f"/api/v1/datasets/{dataset.id}/reactions/search?pb_reaction_id={reaction.pb_reaction_id}"
        )
        .raise_for_status()
        .json()
    )
    assert response_data["id"] == reaction.id


async def test_download_reaction(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    reaction = await create_test_reaction(
        test_db_session, mock_authenticated_user, dataset
    )

    response_data = api_client.get(
        f"/api/v1/datasets/{dataset.id}/reactions/{reaction.id}/download?file_format=json"
    ).raise_for_status()

    decompressed_data = json.loads(response_data.content)
    assert decompressed_data["reactionId"] == reaction.pb_reaction_id


async def test_update_reaction(api_client, mock_authenticated_user, test_db_session):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    reaction = await create_test_reaction(
        test_db_session, mock_authenticated_user, dataset
    )

    reaction_id = faker.uuid4()
    payload = {
        "binpb": b64encode(
            Reaction(reaction_id=reaction_id).SerializeToString()
        ).decode()
    }
    response_data = (
        api_client.patch(
            f"/api/v1/datasets/{dataset.id}/reactions/{reaction.id}", json=payload
        )
        .raise_for_status()
        .json()
    )

    reaction_pb = load_message(b64decode(response_data["binpb"]), Reaction, "binpb")
    assert reaction_pb.reaction_id == reaction_id


async def test_update_nonexistent_reaction(
    api_client, mock_authenticated_user, test_db_session
):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    payload = {
        "binpb": b64encode(Reaction(reaction_id="test").SerializeToString()).decode()
    }
    response_data = api_client.patch(
        f"/api/v1/datasets/{dataset.id}/reactions/{100500}", json=payload
    )

    assert response_data.status_code == status.HTTP_404_NOT_FOUND


async def test_update_reaction_rejects_oversized_attachments(
    api_client, mock_authenticated_user, test_db_session
):
    # Cumulative file attachments over 10 MB are rejected at save time. (#543)
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    reaction = await create_test_reaction(
        test_db_session, mock_authenticated_user, dataset
    )

    pb_reaction = Reaction(reaction_id=faker.uuid4())
    pb_reaction.observations.add().image.bytes_value = b"x" * (10 * 1024 * 1024 + 1)
    payload = {"binpb": b64encode(pb_reaction.SerializeToString()).decode()}
    response = api_client.patch(
        f"/api/v1/datasets/{dataset.id}/reactions/{reaction.id}", json=payload
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert "10 MB" in response.json()["detail"]


async def test_update_reaction_allows_attachments_under_limit(
    api_client, mock_authenticated_user, test_db_session
):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    reaction = await create_test_reaction(
        test_db_session, mock_authenticated_user, dataset
    )

    pb_reaction = Reaction(reaction_id=faker.uuid4())
    pb_reaction.observations.add().image.bytes_value = b"x" * (
        1024 * 1024
    )  # 1 MB, well under the 10 MB cap
    payload = {"binpb": b64encode(pb_reaction.SerializeToString()).decode()}
    api_client.patch(
        f"/api/v1/datasets/{dataset.id}/reactions/{reaction.id}", json=payload
    ).raise_for_status()


async def test_update_reaction_with_duplicate_reaction_id(
    api_client, mock_authenticated_user, test_db_session
):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    reaction = await create_test_reaction(
        test_db_session, mock_authenticated_user, dataset
    )

    payload = {
        "binpb": b64encode(
            Reaction(reaction_id=reaction.pb_reaction_id).SerializeToString()
        ).decode()
    }
    response_data = (
        api_client.patch(
            f"/api/v1/datasets/{dataset.id}/reactions/{reaction.id}", json=payload
        )
        .raise_for_status()
        .json()
    )
    assert reaction.pb_reaction_id in response_data["pb_reaction_id"]

    # try to create new reaction with the reaction_id="updated"
    payload = {
        "binpb": b64encode(
            Reaction(reaction_id=response_data["pb_reaction_id"]).SerializeToString()
        ).decode()
    }
    response = (
        api_client.post(f"/api/v1/datasets/{dataset.id}/reactions", json=payload)
        .raise_for_status()
        .json()
    )
    assert f"duplicate-{reaction.pb_reaction_id}" in response["pb_reaction_id"]
