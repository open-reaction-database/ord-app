# Copyright 2026 Open Reaction Database Project Authors
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

"""Mapping a query's failures to HTTP statuses."""

import pytest
from fastapi import HTTPException, status
from ord_schema.search import execute
from ord_schema.search.query import QueryError

from ord_viewer.searching import search_errors


@pytest.mark.parametrize("error_type", [ValueError, QueryError])
def test_a_value_error_is_unprocessable(error_type):
    error = error_type("bad query")
    with pytest.raises(HTTPException) as raised, search_errors():
        raise error
    assert raised.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert raised.value.detail == "bad query"


def test_a_timeout_is_a_gateway_timeout():
    error = TimeoutError("too slow")
    with pytest.raises(HTTPException) as raised, search_errors():
        raise error
    assert raised.value.status_code == status.HTTP_504_GATEWAY_TIMEOUT
    assert raised.value.detail == "too slow"


def test_a_pairing_error_propagates():
    error = execute.PairingError("stale")
    with pytest.raises(execute.PairingError) as raised, search_errors():
        raise error
    assert raised.value is error
