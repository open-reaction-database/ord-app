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

"""Startup, shutdown, settings, and the /api routes."""

import asyncio
import re
import shutil
from typing import Any

import httpx
import pytest
from anyio import to_thread
from fastapi.testclient import TestClient
from ord_schema.search import execute

from ord_viewer.main import create_app
from ord_viewer.settings import Settings
from ord_viewer.testing import derive_corpus, make_client, offline_resolver


def test_health_returns_the_corpus_fingerprint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    fingerprint = response.json()["fingerprint"]
    assert re.fullmatch(r"[0-9a-f]{16}", fingerprint)
    assert fingerprint == client.app.state.viewer.corpus.fingerprint


def test_health_answers_with_every_worker_thread_taken(corpus_dir):
    app = create_app(lambda: Settings(corpus_dir=corpus_dir), resolver=offline_resolver)

    async def probe_with_no_free_thread() -> int:
        limiter = to_thread.current_default_thread_limiter()
        limiter.total_tokens = 1
        await limiter.acquire_on_behalf_of(object())
        transport = httpx.ASGITransport(app=app)
        async with (
            app.router.lifespan_context(app),
            httpx.AsyncClient(transport=transport, base_url="http://viewer") as client,
        ):
            response = await asyncio.wait_for(client.get("/api/health"), timeout=2)
        return response.status_code

    assert asyncio.run(probe_with_no_free_thread()) == 200


def test_derives_and_opens_a_corpus_whose_path_holds_a_glob_metacharacter(tmp_path):
    root = tmp_path / "corpus[1]"
    root.mkdir()
    derive_corpus(root)
    with make_client(root) as client:
        assert client.get("/api/health").status_code == 200


def test_startup_fails_without_a_corpus_directory():
    app = create_app(lambda: Settings(corpus_dir=None), resolver=offline_resolver)
    client = TestClient(app)
    with pytest.raises(ValueError, match="ORD_VIEWER_CORPUS_DIR"), client:
        pass


@pytest.mark.parametrize(
    "missing", ["projections", "structures", "pivots", "occurrences", "sources"]
)
def test_startup_names_a_missing_tree(corpus_dir, tmp_path, missing):
    partial = tmp_path / "corpus"
    shutil.copytree(corpus_dir, partial)
    shutil.rmtree(partial / missing)
    with (
        pytest.raises(FileNotFoundError, match=f"no {missing}/ directory"),
        make_client(partial),
    ):
        pass


def _record_closes(monkeypatch):
    """Wrap Corpus.close to count each call, then run the original.

    Args:
        monkeypatch: The fixture that installs the wrapper.

    Returns:
        The list of corpora closed so far, appended to on each call.
    """
    original = execute.Corpus.close
    calls = []

    def close(self):
        calls.append(self)
        original(self)

    monkeypatch.setattr(execute.Corpus, "close", close)
    return calls


def test_startup_closes_the_corpus_when_the_pivot_check_fails(monkeypatch, corpus_dir):
    def check_pivots(self):
        raise execute.PairingError("stale")

    monkeypatch.setattr(execute.Corpus, "check_pivots", check_pivots)
    closes = _record_closes(monkeypatch)
    with pytest.raises(execute.PairingError, match="stale"), make_client(corpus_dir):
        pass
    assert len(closes) == 1


def test_shutdown_closes_the_corpus(monkeypatch, corpus_dir):
    closes = _record_closes(monkeypatch)
    with make_client(corpus_dir):
        assert closes == []
    assert len(closes) == 1


def test_serving_exception_still_closes_the_corpus(monkeypatch, corpus_dir):
    app = create_app(lambda: Settings(corpus_dir=corpus_dir), resolver=offline_resolver)
    closes = _record_closes(monkeypatch)

    async def serve_and_fail() -> None:
        async with app.router.lifespan_context(app):
            raise RuntimeError("serving failed")

    serving = serve_and_fail()
    with pytest.raises(RuntimeError, match="serving failed"):
        asyncio.run(serving)
    assert len(closes) == 1


def test_api_docs_are_served_under_api(client):
    openapi = client.get("/api/openapi.json")
    assert openapi.status_code == 200
    assert "/api/health" in openapi.json()["paths"]
    assert client.get("/api/docs").status_code == 200
    assert client.get("/openapi.json").status_code == 404
    assert client.get("/docs").status_code == 404


def test_settings_come_from_the_environment(monkeypatch, corpus_dir):
    monkeypatch.setenv("ORD_VIEWER_CORPUS_DIR", str(corpus_dir))
    monkeypatch.setenv("ORD_VIEWER_MAX_CONCURRENT", "2")
    app = create_app(resolver=offline_resolver)
    with TestClient(app):
        settings = app.state.viewer.settings
        assert settings.max_concurrent == 2
        assert settings.corpus_dir == corpus_dir


def test_an_empty_corpus_directory_variable_counts_as_unset(monkeypatch):
    monkeypatch.setenv("ORD_VIEWER_CORPUS_DIR", "")
    client = TestClient(create_app(resolver=offline_resolver))
    with pytest.raises(ValueError, match="ORD_VIEWER_CORPUS_DIR"), client:
        pass


_SEARCH_ERRORS = {"422", "503", "504"}


@pytest.mark.parametrize(
    ("method", "path", "statuses"),
    [
        ("post", "/api/search", _SEARCH_ERRORS),
        ("post", "/api/ask", _SEARCH_ERRORS | {"429", "502"}),
        ("get", "/api/datasets/{dataset_id}/compounds", _SEARCH_ERRORS | {"404"}),
        ("get", "/api/datasets/{dataset_id}", {"404", "422"}),
        ("get", "/api/reactions/{reaction_id}", {"404", "422"}),
        ("post", "/api/download", {"404", "422"}),
    ],
)
def test_the_schema_declares_each_routes_errors(method, path, statuses):
    operation = create_app().openapi()["paths"][path][method]
    assert {code for code in operation["responses"] if code != "200"} == statuses


def _component(openapi: dict[str, Any], reference: dict[str, str]) -> dict[str, Any]:
    """Return the component schema a $ref names.

    Args:
        openapi: The app's OpenAPI document.
        reference: A schema holding only a $ref to a component.

    Returns:
        The component's schema.
    """
    return openapi["components"]["schemas"][reference["$ref"].rsplit("/", 1)[-1]]


@pytest.mark.parametrize(
    ("method", "path"),
    [("post", "/api/search"), ("get", "/api/datasets/{dataset_id}/compounds")],
)
def test_a_search_route_publishes_both_unprocessable_bodies(method, path):
    openapi = create_app().openapi()
    responses = openapi["paths"][path][method]["responses"]
    schema = responses["422"]["content"]["application/json"]["schema"]
    assert {_component(openapi, option)["title"] for option in schema["anyOf"]} == {
        "ErrorDetail",
        "ValidationErrors",
    }


def test_the_validation_errors_mirror_fastapis_own():
    openapi = create_app().openapi()
    schemas = openapi["components"]["schemas"]
    item = _component(
        openapi, schemas["ValidationErrors"]["properties"]["detail"]["items"]
    )
    fastapi_item = schemas["ValidationError"]
    assert item["required"] == fastapi_item["required"]
    assert item["properties"].keys() == fastapi_item["properties"].keys()


def test_the_search_results_publish_their_kind_and_their_bound():
    openapi = create_app().openapi()
    ok = openapi["paths"]["/api/search"]["post"]["responses"]["200"]
    options = ok["content"]["application/json"]["schema"]["oneOf"]
    results = {
        result["title"]: result
        for result in (_component(openapi, option) for option in options)
    }
    assert results.keys() == {"ReactionsResult", "TableResult"}
    for result in results.values():
        assert "kind" in result["required"]
        bound = f"{execute.DEFAULT_MAX_ROWS:,}"
        assert bound in result["properties"]["truncated"]["description"]
    reaction_ids = results["ReactionsResult"]["properties"]["reaction_ids"]
    assert reaction_ids["maxItems"] == execute.DEFAULT_MAX_ROWS
    assert results["TableResult"]["properties"]["rows"]["maxItems"] == (
        execute.DEFAULT_MAX_ROWS
    )
