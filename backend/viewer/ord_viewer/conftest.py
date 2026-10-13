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

"""Shared fixtures: a derived corpus, a client over it, and asyncio for async tests."""

import pathlib
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from ord_viewer.testing import derive_corpus, make_client


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture(scope="session")
def corpus_dir(tmp_path_factory: pytest.TempPathFactory) -> pathlib.Path:
    root = tmp_path_factory.mktemp("corpus")
    derive_corpus(root)
    return root


@pytest.fixture(scope="session")
def client(corpus_dir: pathlib.Path) -> Iterator[TestClient]:
    with make_client(corpus_dir) as test_client:
        yield test_client
