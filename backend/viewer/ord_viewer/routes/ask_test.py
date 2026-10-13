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

"""Questions in English, answered through a scripted stand-in for the model."""

import types
from collections.abc import Callable, Generator
from typing import Any, cast

import anthropic
import httpx2
import pytest
from anthropic.types import TextBlock, ToolUseBlock
from fastapi import FastAPI
from fastapi.testclient import TestClient
from ord_schema.search import nl

from ord_viewer.routes.ask import ask_client_from_environment, get_ask_client
from ord_viewer.testing import hold_slot, make_client

_PYRIDINE_QUERY = {
    "where": {
        "op": "exists",
        "path": "inputs.components",
        "where": {"op": "substructure", "path": "smiles", "smarts": "c1ccncc1"},
    }
}
_PYRIDINE_ANSWER = "One reaction uses a pyridine."
# A response the model's safety classifiers stopped.
_DECLINED = "declined"
_MESSAGES_URL = "https://api.anthropic.com/v1/messages"


class _StubClient:
    """Answers messages.create from a script: a query, prose, a refusal, or an error.

    Args:
        *responses: One per call, in order. A dict holding "reason" is a refusal, any
            other dict a query, _DECLINED a classifier's stop, another string the
            answer's prose, and an exception is raised.
    """

    def __init__(self, *responses: Any) -> None:
        self._responses = list(responses)
        self.requests: list[dict[str, Any]] = []
        self.messages = self
        self.closed = False

    def close(self) -> None:
        """Record that the app closed the client, as it does at shutdown."""
        self.closed = True

    def create(self, **kwargs: Any) -> types.SimpleNamespace:
        """Record the request and answer with the next scripted response.

        Args:
            **kwargs: The request nl.ask sends.

        Returns:
            A message with the scripted content and nominal usage.

        Raises:
            Exception: The next scripted response, when it is one.
        """
        self.requests.append(kwargs)
        payload = self._responses.pop(0)
        if isinstance(payload, Exception):
            raise payload
        usage = types.SimpleNamespace(
            input_tokens=1,
            output_tokens=1,
            cache_creation_input_tokens=0,
            cache_read_input_tokens=0,
        )
        if payload == _DECLINED:
            details = types.SimpleNamespace(category="cyber")
            return types.SimpleNamespace(
                content=[], usage=usage, stop_reason="refusal", stop_details=details
            )
        if isinstance(payload, str):
            content: list[Any] = [TextBlock(type="text", text=payload)]
        else:
            tool = "cannot_answer" if "reason" in payload else "build_query"
            content = [
                ToolUseBlock(type="tool_use", id="toolu_stub", name=tool, input=payload)
            ]
        stop = "end_turn" if isinstance(payload, str) else "tool_use"
        return types.SimpleNamespace(content=content, usage=usage, stop_reason=stop)


@pytest.fixture
def ask_with(client: TestClient) -> Generator[Callable[..., _StubClient]]:
    app = cast(FastAPI, client.app)

    def install(*responses: Any) -> _StubClient:
        stub = _StubClient(*responses)
        app.dependency_overrides[get_ask_client] = lambda: stub
        return stub

    yield install
    app.dependency_overrides.clear()


def _api_error(error_type: type[anthropic.APIStatusError], code: int) -> Exception:
    request = httpx2.Request("POST", _MESSAGES_URL)
    response = httpx2.Response(code, request=request, json={"error": {}})
    return error_type("the model said no", response=response, body=None)


def test_answers_a_question(client, ask_with):
    stub = ask_with(_PYRIDINE_QUERY, _PYRIDINE_ANSWER)
    response = client.post("/api/ask", json={"question": "reactions with a pyridine"})
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["text"] == _PYRIDINE_ANSWER
    assert body["result"] == {
        "kind": "reactions",
        "reaction_ids": ["ord-viewer0101"],
        "truncated": False,
    }
    assert body["query"]["where"]["path"] == "inputs.components"
    assert len(stub.requests) == 2


@pytest.mark.parametrize("question", ["   ", "x" * 2001])
def test_refuses_an_empty_or_long_question_before_asking(client, ask_with, question):
    stub = ask_with()
    assert client.post("/api/ask", json={"question": question}).status_code == 422
    assert stub.requests == []


def test_refuses_an_unknown_key_before_asking(client, ask_with):
    stub = ask_with()
    body = {"question": "anything", "session": "abc"}
    response = client.post("/api/ask", json=body)
    assert response.status_code == 422
    assert response.json()["detail"][0]["type"] == "extra_forbidden"
    assert stub.requests == []


def test_a_declined_request_is_unprocessable(client, ask_with):
    ask_with(_DECLINED)
    response = client.post("/api/ask", json={"question": "anything"})
    assert response.status_code == 422
    assert "cyber" in response.json()["detail"]


def test_an_unanswerable_question(client, ask_with):
    ask_with({"reason": "the corpus records no prices"})
    response = client.post("/api/ask", json={"question": "what does pyridine cost"})
    assert response.status_code == 422
    assert "prices" in response.json()["detail"]


@pytest.mark.parametrize(
    ("error", "code"),
    [
        (_api_error(anthropic.RateLimitError, 429), 429),
        (_api_error(anthropic.InternalServerError, 500), 503),
        (anthropic.APITimeoutError(httpx2.Request("POST", _MESSAGES_URL)), 503),
    ],
)
def test_a_model_failure_has_its_own_status(client, ask_with, error, code):
    ask_with(error)
    assert client.post("/api/ask", json={"question": "anything"}).status_code == code


def test_a_query_that_never_compiles_is_a_bad_gateway(client, ask_with):
    unknown = {"where": {"op": "eq", "path": "no_such_field", "value": {"literal": 1}}}
    ask_with(unknown, unknown)
    response = client.post("/api/ask", json={"question": "anything"})
    assert response.status_code == 502
    assert "no_such_field" in response.json()["detail"]


def test_an_unknown_compound_is_unprocessable(client, ask_with):
    query = {
        "where": {
            **_PYRIDINE_QUERY["where"],
            "where": {
                "op": "substructure",
                "path": "smiles",
                "compound": "unobtainium",
            },
        }
    }
    stub = ask_with(query)
    response = client.post("/api/ask", json={"question": "reactions with unobtainium"})
    assert response.status_code == 422
    assert "unobtainium" in response.json()["detail"]
    assert len(stub.requests) == 1


def test_a_search_past_its_timeout(corpus_dir):
    stub = _StubClient(_PYRIDINE_QUERY)
    with make_client(
        corpus_dir, ask_client=stub, search_timeout_seconds=1e-9
    ) as client:
        response = client.post("/api/ask", json={"question": "anything"})
    assert response.status_code == 504


def test_shutdown_closes_the_model_client(corpus_dir):
    stub = _StubClient()
    with make_client(corpus_dir, ask_client=stub):
        assert not stub.closed
    assert stub.closed


def test_no_key_means_no_answers(client):
    response = client.post("/api/ask", json={"question": "anything"})
    assert response.status_code == 503
    assert response.json()["detail"] == "no Anthropic API key is configured"


def test_an_ask_waits_for_a_search_slot(corpus_dir):
    stub = _StubClient(_PYRIDINE_QUERY, _PYRIDINE_ANSWER)
    with (
        make_client(
            corpus_dir, ask_client=stub, max_concurrent=1, slot_wait_seconds=0.05
        ) as client,
        hold_slot(client),
    ):
        response = client.post("/api/ask", json={"question": "anything"})
    assert response.status_code == 503
    assert "slot" in response.json()["detail"]
    assert stub.requests == []


@pytest.mark.parametrize("variable", ["ORD_ANTHROPIC_API_KEY", "ANTHROPIC_API_KEY"])
def test_a_key_in_the_environment_builds_a_bounded_client(monkeypatch, variable):
    monkeypatch.delenv("ORD_ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.setenv(variable, "test-key")
    client = ask_client_from_environment()
    assert client is not None
    assert client.timeout == 30.0
    assert client.max_retries == 0


def test_an_overloaded_model_is_asked_once(monkeypatch, corpus_dir):
    requests: list[httpx2.Request] = []

    def overloaded(request: httpx2.Request) -> httpx2.Response:
        requests.append(request)
        error = {"type": "overloaded_error", "message": "overloaded"}
        return httpx2.Response(
            529, headers={"retry-after": "1"}, json={"type": "error", "error": error}
        )

    http_client = httpx2.Client(transport=httpx2.MockTransport(overloaded))
    monkeypatch.setenv("ORD_ANTHROPIC_API_KEY", "test-key")
    monkeypatch.setattr(
        nl,
        "get_client",
        lambda: anthropic.Anthropic(api_key="test-key", http_client=http_client),
    )
    with make_client(corpus_dir, ask_client=ask_client_from_environment()) as client:
        response = client.post("/api/ask", json={"question": "anything"})
    assert response.status_code == 503
    assert len(requests) == 1


def test_no_key_in_the_environment_builds_no_client(monkeypatch):
    monkeypatch.delenv("ORD_ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    assert ask_client_from_environment() is None


def test_logs_questions_to_stdout(corpus_dir, capfd):
    stub = _StubClient(_PYRIDINE_QUERY, _PYRIDINE_ANSWER)
    with make_client(corpus_dir, ask_client=stub, ask_log="stdout") as client:
        question = {"question": "reactions with a pyridine"}
        assert client.post("/api/ask", json=question).status_code == 200
    assert "reactions with a pyridine" in capfd.readouterr().out
