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

"""Tests for ord_app.api.routers.datasets."""

import gzip
import itertools
from base64 import b64decode
from io import BytesIO

import pytest
from httpx import HTTPStatusError
from ord_schema.proto.dataset_pb2 import Dataset

from ord_app.api import load_dataset, write_message
from ord_app.api.testing import TEST_USER_ID


def test_list_datasets(test_client):
    response = test_client.get("/editor/list_datasets", params={"user_id": TEST_USER_ID})
    response.raise_for_status()
    assert len(response.json()) == 3


def test_fetch_dataset(test_client):
    response = test_client.get(
        "/editor/fetch_dataset", params={"user_id": TEST_USER_ID, "dataset_name": "Deoxyfluorination screen"}
    )
    response.raise_for_status()
    dataset = Dataset.FromString(b64decode(response.json()))
    assert len(dataset.reactions) == 80


def test_fetch_unknown_dataset(test_client):
    response = test_client.get("/editor/fetch_dataset", params={"user_id": TEST_USER_ID, "dataset_name": "UNKNOWN"})
    with pytest.raises(HTTPStatusError):
        response.raise_for_status()
    assert response.status_code == 404


@pytest.mark.parametrize("kind", ("binpb", "json", "txtpb"))
def test_download_dataset(test_client, kind):
    response = test_client.get(
        "/editor/download_dataset",
        params={"user_id": TEST_USER_ID, "dataset_name": "Deoxyfluorination screen", "kind": kind},
    )
    response.raise_for_status()
    dataset = load_dataset(gzip.decompress(response.read()), kind=kind)
    assert len(dataset.reactions) == 80


@pytest.mark.parametrize("kind,compress", itertools.product(["binpb", "json", "txtpb"], [False, True]))
def test_upload_dataset(test_client, kind, compress):
    dataset_name = "test"
    dataset = Dataset(name=dataset_name)
    data = write_message(dataset, kind)
    suffix = kind
    if compress:
        suffix = f"{kind}.gz"
        data = gzip.compress(data)
    response = test_client.post(
        f"/editor/upload_dataset/{TEST_USER_ID}", files={"file": (f"test.{suffix}", BytesIO(data))}
    )
    response.raise_for_status()
    response = test_client.get("/editor/fetch_dataset", params={"user_id": TEST_USER_ID, "dataset_name": dataset_name})
    response.raise_for_status()


def test_create_dataset(test_client):
    dataset_name = "test"
    response = test_client.get("/editor/create_dataset", params={"user_id": TEST_USER_ID, "dataset_name": dataset_name})
    response.raise_for_status()
    response = test_client.get("/editor/fetch_dataset", params={"user_id": TEST_USER_ID, "dataset_name": dataset_name})
    response.raise_for_status()


def test_delete_dataset(test_client):
    dataset_name = "Deoxyfluorination screen"
    response = test_client.get("/editor/fetch_dataset", params={"user_id": TEST_USER_ID, "dataset_name": dataset_name})
    response.raise_for_status()
    response = test_client.get("/editor/delete_dataset", params={"user_id": TEST_USER_ID, "dataset_name": dataset_name})
    response.raise_for_status()
    response = test_client.get("/editor/fetch_dataset", params={"user_id": TEST_USER_ID, "dataset_name": dataset_name})
    with pytest.raises(HTTPStatusError):
        response.raise_for_status()
    assert response.status_code == 404
