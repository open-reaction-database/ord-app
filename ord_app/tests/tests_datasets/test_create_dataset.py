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
from io import BytesIO

import pytest
from fastapi import status
from sqlalchemy import select

from ord_app.service_api.domain.reactions import validate_reactions_task
from ord_app.service_api.models import ReactionModel
from ord_app.service_api.settings import RuntimeSettings


async def test_create_dataset(api_client, mock_authenticated_user):
    user, _, group = mock_authenticated_user

    payload = {"name": "test name", "description": "test description"}
    response_data = api_client.post(f"/api/v1/groups/{group.id}/datasets", json=payload).raise_for_status().json()

    assert response_data["name"] == payload["name"]
    assert response_data["description"] == payload["description"]

    assert response_data["owner"]["id"] == user.id
    assert response_data["owner"]["external_id"] == user.external_id


async def test_create_empty_dataset(api_client, mock_authenticated_user):
    *_, group = mock_authenticated_user

    response_data = api_client.post(f"/api/v1/groups/{group.id}/datasets", json={}).raise_for_status().json()

    assert response_data["name"] == ""
    assert response_data["description"] == ""


@pytest.mark.parametrize(
    "kind,filename,expected_name",
    (
        ("txtpb", "empty.txtpb", "empty"),
        ("txtpb", "full.txtpb", "full"),
        ("txtpb", "reaction_duplication.txtpb", "full")
    )
)
async def test_upload_dataset(kind, filename, expected_name, api_client, mock_authenticated_user):
    user, _, group = mock_authenticated_user

    with open(RuntimeSettings.base_dir.parent/"tests"/"testdata"/filename) as fd:
        response_data = api_client.post(
            f"/api/v1/groups/{group.id}/datasets/upload", files={"file": (filename, fd.read())}
        ).raise_for_status().json()
        response_data["name"] = expected_name
        response_data["owner"]["id"] = user.id


async def test_upload_dataset_with_reaction_validation(api_client, mock_authenticated_user, test_db_session):
    user, _, group = mock_authenticated_user

    with open(RuntimeSettings.base_dir.parent / "tests" / "testdata" / "ord-nielsen-example.txtpb", "rb") as fd:
        response_data = api_client.post(
            f"/api/v1/groups/{group.id}/datasets/upload", files={"file": ("ord-nielsen-example.txtpb", fd.read())}
        ).raise_for_status().json()

        response_data["name"] = "Deoxyfluorination screen"
        response_data["owner"]["id"] = user.id

    stmt = select(ReactionModel.is_valid).where(ReactionModel.dataset_id == response_data["id"])
    await validate_reactions_task(test_db_session)
    assert {True,} == set((await test_db_session.scalars(stmt)).all())

async def test_upload_wrong_file_extension(api_client, mock_authenticated_user):
    user, _, group = mock_authenticated_user

    response_data = api_client.post(
        f"/api/v1/groups/{group.id}/datasets/upload", files={"file": ("wrong.pdf", BytesIO(b"pdf"))}
    )
    assert response_data.status_code == status.HTTP_400_BAD_REQUEST


async def test_upload_wrong_file(api_client, mock_authenticated_user):
    user, _, group = mock_authenticated_user

    response_data = api_client.post(
        f"/api/v1/groups/{group.id}/datasets/upload", files={"file": ("wrongfile.pb", BytesIO(b"pdf"))}
    )
    assert response_data.status_code == status.HTTP_400_BAD_REQUEST
