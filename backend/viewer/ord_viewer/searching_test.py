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

from decimal import Decimal

import pyarrow as pa
import pytest
from fastapi import HTTPException, status
from ord_schema.search import execute
from ord_schema.search.query import Query, QueryError
from pydantic import TypeAdapter

from ord_viewer.schemas import SearchResult, TableResult
from ord_viewer.searching import search_errors, to_result


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


def test_a_plain_query_gives_reaction_ids_and_reads_the_truncation_flag():
    table = pa.table({"reaction_id": ["ord-a", "ord-b"]}).replace_schema_metadata(
        {execute.TRUNCATED: b"true"}
    )
    result = to_result(Query.model_validate({"limit": 2}), table)
    assert result.kind == "reactions"
    assert result.reaction_ids == ["ord-a", "ord-b"]
    assert result.truncated


def test_an_aggregate_gives_a_table():
    request = Query.model_validate(
        {
            "aggregate": {
                "group_by": ["dataset_id"],
                "measures": [{"fn": "count", "name": "reactions"}],
            }
        }
    )
    table = pa.table({"dataset_id": ["ord_dataset-x"], "reactions": [3]})
    result = to_result(request, table)
    assert result.kind == "table"
    assert result.columns == ["dataset_id", "reactions"]
    assert result.rows == [["ord_dataset-x", 3]]
    assert not result.truncated


def test_repeated_column_names_keep_every_row_aligned():
    request = Query.model_validate(
        {
            "aggregate": {
                "group_by": ["dataset_id"],
                "measures": [{"fn": "count", "name": "n"}],
            }
        }
    )
    table = pa.Table.from_arrays(
        [pa.array(["a", "b"]), pa.array([3, 2]), pa.array([4, 1])],
        names=["dataset_id", "n", "n"],
    )
    result = to_result(request, table)
    assert isinstance(result, TableResult)
    assert result.columns == ["dataset_id", "n", "n"]
    assert result.rows == [["a", 3, 4], ["b", 2, 1]]


def test_a_fractional_decimal_column_gives_floats():
    request = Query.model_validate(
        {
            "aggregate": {
                "group_by": ["dataset_id"],
                "measures": [
                    {
                        "fn": "sum",
                        "path": "conditions.temperature.setpoint.value",
                        "name": "total",
                    }
                ],
            }
        }
    )
    table = pa.table(
        {
            "dataset_id": ["a", "b"],
            "total": pa.array([Decimal("1.25"), None], type=pa.decimal128(10, 2)),
        }
    )
    result = to_result(request, table)
    assert isinstance(result, TableResult)
    assert result.rows == [["a", 1.25], ["b", None]]
    assert type(result.rows[0][1]) is float


def test_a_bytes_cell_is_base64_in_json():
    result = TableResult(columns=["image"], rows=[[b"\xff"]], truncated=False)
    dumped = TypeAdapter(SearchResult).dump_python(result, mode="json")
    assert dumped["rows"] == [["/w=="]]


def test_bytes_nested_in_a_cell_are_base64_in_json():
    cells = [{"bytes_value": b"\xff"}, [b"\xff"]]
    result = TableResult(columns=["image", "list"], rows=[cells], truncated=False)
    dumped = TypeAdapter(SearchResult).dump_python(result, mode="json")
    assert dumped["rows"] == [[{"bytes_value": "/w=="}, ["/w=="]]]


def test_python_mode_keeps_the_bytes():
    result = TableResult(columns=["image"], rows=[[b"\xff"]], truncated=False)
    assert result.model_dump()["rows"] == [[b"\xff"]]
