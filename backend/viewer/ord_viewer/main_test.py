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

import httpx
import pytest
from anyio import to_thread
from fastapi.testclient import TestClient
from ord_schema.search import execute

from ord_viewer.main import create_app
from ord_viewer.settings import Settings
from ord_viewer.testing import make_client, offline_resolver


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


def test_opens_a_corpus_whose_path_holds_a_glob_metacharacter(corpus_dir, tmp_path):
    copied = tmp_path / "corpus[1]"
    shutil.copytree(corpus_dir, copied)
    with make_client(copied) as client:
        assert client.get("/api/health").status_code == 200


def test_startup_fails_without_a_corpus_directory():
    app = create_app(lambda: Settings(corpus_dir=None), resolver=offline_resolver)
    with pytest.raises(ValueError, match="ORD_VIEWER_CORPUS_DIR"), TestClient(app):
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

    with pytest.raises(RuntimeError, match="serving failed"):
        asyncio.run(serve_and_fail())
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
    with (
        pytest.raises(ValueError, match="ORD_VIEWER_CORPUS_DIR"),
        TestClient(create_app(resolver=offline_resolver)),
    ):
        pass
