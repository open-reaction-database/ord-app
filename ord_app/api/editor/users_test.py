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

"""Tests for ord_app.api.editor.users."""

import pytest
from httpx import HTTPStatusError

from ord_app.api.testing import TEST_USER_ID


def test_create_user(test_client, test_cursor):
    response = test_client.get("/api/editor/create_user", params={"user_name": "test"})
    response.raise_for_status()
    user_id = response.json()
    test_cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
    assert test_cursor.fetchone()["user_id"] == user_id


def test_delete_user(test_client, test_cursor):
    response = test_client.get("/api/editor/delete_user", params={"user_id": TEST_USER_ID})
    with pytest.raises(HTTPStatusError):
        response.raise_for_status()
    # Delete user datasets and try again.
    response = test_client.get("/api/editor/list_datasets", params={"user_id": TEST_USER_ID})
    response.raise_for_status()
    for dataset_name in response.json():
        response = test_client.get(
            "/api/editor/delete_dataset", params={"user_id": TEST_USER_ID, "dataset_name": dataset_name}
        )
        response.raise_for_status()
    response = test_client.get("/api/editor/delete_user", params={"user_id": TEST_USER_ID})
    response.raise_for_status()
    test_cursor.execute("SELECT * FROM users WHERE user_id = %s", (TEST_USER_ID,))
    assert test_cursor.fetchone() is None
