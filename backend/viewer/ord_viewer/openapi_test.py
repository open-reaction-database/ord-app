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

"""The committed OpenAPI document, which the viewer's frontend types are built from."""

import json

from ord_viewer import openapi
from ord_viewer.main import app


def test_the_committed_document_matches_the_app():
    assert openapi.DOCUMENT_PATH.read_text() == openapi.render(), (
        "backend/viewer/openapi.json is stale: run `uv run python -m ord_viewer.openapi`"
        " from backend/viewer, then `npm run generate:api -w apps/viewer` from frontend/"
    )


def test_render_is_the_app_document_as_indented_json():
    rendered = openapi.render()
    assert json.loads(rendered) == app.openapi()
    assert rendered.endswith("}\n")


def test_write_writes_the_rendered_document(tmp_path):
    path = tmp_path / "openapi.json"
    openapi.write(path)
    assert path.read_text() == openapi.render()
