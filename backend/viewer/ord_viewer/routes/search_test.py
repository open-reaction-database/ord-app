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

"""The /api/search route."""

import time
from concurrent.futures import ThreadPoolExecutor

import pytest
from anyio import to_thread
from fastapi.testclient import TestClient

from ord_viewer.testing import hold_slot, make_client, portal, slot_waiters

_PYRIDINE_INPUT = {
    "op": "exists",
    "path": "inputs.components",
    "where": {"op": "substructure", "path": "smiles", "smarts": "c1ccncc1"},
}


def _ids(client, query):
    response = client.post("/api/search", json={"query": query})
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["kind"] == "reactions"
    return set(body["reaction_ids"])


def test_substructure(client):
    assert _ids(client, {"where": _PYRIDINE_INPUT}) == {"ord-viewer0101"}


def test_a_compound_by_name(client):
    where = {"op": "substructure", "path": "smiles", "compound": "pyridine"}
    query = {"where": {**_PYRIDINE_INPUT, "where": where}}
    assert _ids(client, query) == {"ord-viewer0101"}


def test_an_unknown_name_is_unprocessable(client):
    where = {"op": "substructure", "path": "smiles", "compound": "unobtainium"}
    query = {"where": {**_PYRIDINE_INPUT, "where": where}}
    response = client.post("/api/search", json={"query": query})
    assert response.status_code == 422
    assert "unobtainium" in response.json()["detail"]


@pytest.mark.parametrize(
    ("chirality", "expected"),
    [(True, {"ord-viewer0102"}), (False, {"ord-viewer0102", "ord-viewer0201"})],
)
def test_stereocenters_match_unless_told_not_to(client, chirality, expected):
    query = {
        "where": {
            "op": "exists",
            "path": "inputs.components",
            "where": {
                "op": "substructure",
                "path": "smiles",
                "smarts": "C[C@@H](N)C(=O)O",
                "chirality": chirality,
            },
        }
    }
    assert _ids(client, query) == expected


def test_a_yield_range(client):
    query = {
        "where": {
            "op": "exists",
            "path": "outcomes.products",
            "where": {
                "op": "exists",
                "path": "measurements",
                "where": {
                    "op": "and",
                    "clauses": [
                        {"op": "eq", "path": "type", "value": {"literal": "YIELD"}},
                        {
                            "op": "ge",
                            "path": "percentage.value",
                            "value": {"literal": 60},
                        },
                        {
                            "op": "le",
                            "path": "percentage.value",
                            "value": {"literal": 70},
                        },
                    ],
                },
            },
        }
    }
    assert _ids(client, query) == {"ord-viewer0101"}


def test_a_dataset(client):
    query = {
        "where": {
            "op": "eq",
            "path": "dataset_id",
            "value": {"literal": "ord_dataset-viewer02"},
        }
    }
    assert _ids(client, query) == {"ord-viewer0201", "ord-viewer0202"}


def test_a_first_commit_date(client):
    query = {
        "where": {
            "op": "ge",
            "path": "first_commit.timestamp",
            "value": {"literal": "2022-01-01"},
        }
    }
    assert _ids(client, query) == {"ord-viewer0201", "ord-viewer0202"}


def test_the_latest_first_commit_is_a_date(client):
    query = {
        "aggregate": {
            "group_by": ["dataset_id"],
            "measures": [
                {"fn": "max", "path": "first_commit.timestamp", "name": "arrived"}
            ],
        }
    }
    response = client.post("/api/search", json={"query": query})
    assert response.status_code == 200, response.text
    assert sorted(response.json()["rows"]) == [
        ["ord_dataset-viewer01", "2021-07-28"],
        ["ord_dataset-viewer02", "2023-03-02"],
    ]


def test_a_reaction_smarts(client):
    query = {"where": {"op": "reaction_smarts", "smarts": "cB(O)O.c[Br,I]>>c-c"}}
    assert _ids(client, query) == {"ord-viewer0101"}


def test_no_match_is_an_empty_answer(client):
    where = {"op": "substructure", "path": "smiles", "smarts": "[Xe]"}
    query = {"where": {**_PYRIDINE_INPUT, "where": where}}
    response = client.post("/api/search", json={"query": query})
    assert response.status_code == 200
    assert response.json() == {
        "kind": "reactions",
        "reaction_ids": [],
        "truncated": False,
    }


def test_an_aggregate_is_a_table(client):
    query = {
        "aggregate": {
            "group_by": ["dataset_id"],
            "measures": [{"fn": "count", "name": "reactions"}],
        }
    }
    body = client.post("/api/search", json={"query": query}).json()
    assert body["kind"] == "table"
    assert body["columns"] == ["dataset_id", "reactions"]
    assert sorted(body["rows"]) == [
        ["ord_dataset-viewer01", 3],
        ["ord_dataset-viewer02", 2],
    ]


def test_a_sum_of_integers_is_a_json_integer(client):
    components = {"reduce": "count", "path": "inputs.components"}
    query = {
        "aggregate": {
            "group_by": ["dataset_id"],
            "measures": [{"fn": "sum", "path": components, "name": "components"}],
        }
    }
    response = client.post("/api/search", json={"query": query})
    assert response.status_code == 200, response.text
    assert sorted(response.json()["rows"]) == [
        ["ord_dataset-viewer01", 6],
        ["ord_dataset-viewer02", 5],
    ]


def test_an_unknown_path_is_unprocessable_with_a_message(client):
    query = {"where": {"op": "eq", "path": "no_such_field", "value": {"literal": 1}}}
    response = client.post("/api/search", json={"query": query})
    assert response.status_code == 422
    assert isinstance(response.json()["detail"], str)
    assert "no_such_field" in response.json()["detail"]


def test_an_extra_key_is_unprocessable_with_a_list(client):
    query = {"where": _PYRIDINE_INPUT, "page": 2}
    response = client.post("/api/search", json={"query": query})
    assert response.status_code == 422
    (error,) = response.json()["detail"]
    assert error["type"] == "extra_forbidden"
    assert error["loc"] == ["body", "query", "page"]


def test_an_unknown_top_level_key_is_unprocessable(client):
    response = client.post("/api/search", json={"query": {}, "limit": 1})
    assert response.status_code == 422
    (error,) = response.json()["detail"]
    assert error["type"] == "extra_forbidden"
    assert error["loc"] == ["body", "limit"]


def test_a_query_nested_past_the_recursion_limit_is_unprocessable(client):
    where = {"op": "not_null", "path": "reaction_id"}
    for _ in range(2000):
        where = {"op": "not", "clause": where}
    response = client.post("/api/search", json={"query": {"where": where}})
    assert response.status_code == 422
    assert "recursion_loop" in {error["type"] for error in response.json()["detail"]}


def _nested(depth):
    value = {}
    for _ in range(depth):
        value = {"a": value}
    return value


@pytest.mark.parametrize(
    ("body", "error_type"),
    [
        ({"query": {}, "extra": _nested(2000)}, "extra_forbidden"),
        ({"query": {"limit": _nested(2000)}}, "int_type"),
    ],
)
def test_a_deep_value_in_an_invalid_field_is_unprocessable(client, body, error_type):
    # Pydantic echoes the offending value as the error's input, however deep it is.
    response = client.post("/api/search", json=body)
    assert response.status_code == 422
    assert error_type in {error["type"] for error in response.json()["detail"]}


@pytest.mark.parametrize(
    "measures",
    [
        [{"fn": "count", "name": "n"}, {"fn": "count", "name": "n"}],
        [{"fn": "count", "name": "dataset_id"}],
        [{"fn": "count", "name": "n"}, {"fn": "count", "name": "N"}],
        [{"fn": "count", "name": "DATASET_ID"}],
    ],
    ids=[
        "two measures",
        "a measure and a group",
        "two measures in other cases",
        "a measure and a group in other cases",
    ],
)
def test_a_repeated_output_name_is_unprocessable(client, measures):
    query = {"aggregate": {"group_by": ["dataset_id"], "measures": measures}}
    response = client.post("/api/search", json={"query": query})
    assert response.status_code == 422
    assert "repeats" in response.json()["detail"][0]["msg"]


def test_a_search_past_its_timeout(corpus_dir):
    with make_client(corpus_dir, search_timeout_seconds=1e-9) as client:
        response = client.post(
            "/api/search", json={"query": {"where": _PYRIDINE_INPUT}}
        )
    assert response.status_code == 504


def test_a_failed_search_frees_its_slot(corpus_dir):
    with make_client(corpus_dir, max_concurrent=1, slot_wait_seconds=0.05) as client:
        bad = {"where": {"op": "eq", "path": "no_such_field", "value": {"literal": 1}}}
        assert client.post("/api/search", json={"query": bad}).status_code == 422
        ok = {"query": {"where": _PYRIDINE_INPUT}}
        assert client.post("/api/search", json=ok).status_code == 200
        with hold_slot(client):
            busy = client.post("/api/search", json=ok)
        assert busy.status_code == 503


def _set_thread_tokens(client: TestClient, total: float) -> float:
    """Set the worker threads the app's event loop may run at once.

    Args:
        client: An entered client.
        total: The new number of threads.

    Returns:
        The number it replaced.
    """

    async def swap() -> float:
        limiter = to_thread.current_default_thread_limiter()
        previous = limiter.total_tokens
        limiter.total_tokens = total
        return previous

    return portal(client).call(swap)


def _wait_for_slot_waiters(client: TestClient, count: int) -> None:
    """Wait until count requests are waiting for a search slot; fail after 3 s.

    Args:
        client: An entered client.
        count: How many waiting requests to wait for.
    """
    deadline = time.monotonic() + 3
    while (waiters := slot_waiters(client)) < count:
        if time.monotonic() > deadline:
            pytest.fail(f"only {waiters} of {count} searches reached the slot in 3 s")
        time.sleep(0.01)


def test_a_request_waiting_for_a_slot_holds_no_worker_thread(corpus_dir):
    search = {"query": {"where": _PYRIDINE_INPUT}}
    # The slot wait outlasts the 3 s poll and the 1 s probe, so no search gives up.
    with make_client(corpus_dir, max_concurrent=1, slot_wait_seconds=5) as client:
        tokens = _set_thread_tokens(client, 2)
        try:
            # The slot is released before the executor joins, so the searches finish.
            with ThreadPoolExecutor(max_workers=3) as executor, hold_slot(client):
                waiting = [
                    executor.submit(client.post, "/api/search", json=search)
                    for _ in range(3)
                ]
                _wait_for_slot_waiters(client, len(waiting))
                started = time.monotonic()
                response = client.get("/api/datasets")
                elapsed = time.monotonic() - started
                overlapped = not any(future.done() for future in waiting)
            assert response.status_code == 200
            assert elapsed < 1
            assert overlapped
            assert [future.result().status_code for future in waiting] == [200] * 3
        finally:
            _set_thread_tokens(client, tokens)
