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

import re
import shutil

import pytest
from fastapi.testclient import TestClient

from ord_viewer.main import create_app
from ord_viewer.settings import Settings
from ord_viewer.testing import make_client, offline_resolver


def test_health_returns_the_corpus_fingerprint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    fingerprint = response.json()["fingerprint"]
    assert re.fullmatch(r"[0-9a-f]{16}", fingerprint)
    assert fingerprint == client.app.state.viewer.corpus.fingerprint


def test_startup_fails_without_a_corpus_directory():
    app = create_app(lambda: Settings(corpus_dir=None), resolver=offline_resolver)
    with pytest.raises(ValueError, match="ORD_VIEWER_CORPUS_DIR"), TestClient(app):
        pass


@pytest.mark.parametrize("missing", ["pivots", "occurrences", "sources"])
def test_startup_names_a_missing_tree(corpus_dir, tmp_path, missing):
    partial = tmp_path / "corpus"
    shutil.copytree(corpus_dir, partial)
    shutil.rmtree(partial / missing)
    with (
        pytest.raises(FileNotFoundError, match=f"no {missing}/ directory"),
        make_client(partial),
    ):
        pass
