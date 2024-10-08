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

"""Tests for ord_app.api.editor.reactions."""
import gzip
from base64 import b64decode

import pytest
from ord_schema.proto.dataset_pb2 import Dataset
from ord_schema.proto.reaction_pb2 import Reaction

from ord_app.api import load_message
from ord_app.api.testing import TEST_USER_ID


def test_list_reactions(test_client):
    response = test_client.get(
        "/api/editor/list_reactions", params={"user_id": TEST_USER_ID, "dataset_name": "Deoxyfluorination screen"}
    )
    response.raise_for_status()
    assert len(response.json()) == 80


def test_fetch_reaction(test_client):
    response = test_client.get(
        "/api/editor/fetch_reaction",
        params={"user_id": TEST_USER_ID, "dataset_name": "Deoxyfluorination screen", "index": 0},
    )
    response.raise_for_status()
    reaction = Reaction.FromString(b64decode(response.json()))
    assert reaction.reaction_id == "test_reaction-0"


@pytest.mark.parametrize("kind", ("binpb", "json", "txtpb"))
def test_download_reaction(test_client, kind):
    response = test_client.get(
        "/api/editor/download_reaction",
        params={"user_id": TEST_USER_ID, "dataset_name": "Deoxyfluorination screen", "index": 0, "kind": kind},
    )
    response.raise_for_status()
    reaction = load_message(gzip.decompress(response.read()), Reaction, kind=kind)
    assert reaction.reaction_id == "test_reaction-0"


def test_create_reaction(test_client):
    response = test_client.get(
        "/api/editor/create_reaction",
        params={"user_id": TEST_USER_ID, "dataset_name": "Deoxyfluorination screen", "reaction_id": "test"},
    )
    response.raise_for_status()
    index = response.json()
    assert index == 80
    response = test_client.get(
        "/api/editor/fetch_reaction",
        params={"user_id": TEST_USER_ID, "dataset_name": "Deoxyfluorination screen", "index": index},
    )
    response.raise_for_status()
    reaction = Reaction.FromString(b64decode(response.json()))
    assert reaction.reaction_id == "test"


def test_clone_reaction(test_client):
    response = test_client.get(
        "/api/editor/clone_reaction",
        params={"user_id": TEST_USER_ID, "dataset_name": "Deoxyfluorination screen", "index": 0},
    )
    response.raise_for_status()
    index = response.json()
    assert index == 80
    response = test_client.get(
        "/api/editor/fetch_reaction",
        params={"user_id": TEST_USER_ID, "dataset_name": "Deoxyfluorination screen", "index": index},
    )
    response.raise_for_status()
    reaction = Reaction.FromString(b64decode(response.json()))
    assert reaction.reaction_id == "test_reaction-0"


def test_delete_reaction(test_client):
    response = test_client.get(
        "/api/editor/delete_reaction",
        params={"user_id": TEST_USER_ID, "dataset_name": "Deoxyfluorination screen", "index": 0},
    )
    response.raise_for_status()
    response = test_client.get(
        "/api/editor/fetch_dataset", params={"user_id": TEST_USER_ID, "dataset_name": "Deoxyfluorination screen"}
    )
    response.raise_for_status()
    dataset = Dataset.FromString(b64decode(response.json()))
    assert len(dataset.reactions) == 79
