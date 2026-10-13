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

"""The viewer's OpenAPI document, committed so the frontend can build types from it.

Run ``python -m ord_viewer.openapi`` from backend/viewer to rewrite it.
"""

import json
import pathlib

from ord_viewer.main import app

# backend/viewer/openapi.json.
DOCUMENT_PATH = pathlib.Path(__file__).resolve().parent.parent / "openapi.json"


def render() -> str:
    """Render the app's OpenAPI document as the committed file holds it.

    Returns:
        The document as JSON indented by two spaces, ending in a newline.
    """
    return json.dumps(app.openapi(), indent=2) + "\n"


def write(path: pathlib.Path = DOCUMENT_PATH) -> None:
    """Write the rendered document.

    Args:
        path: Where to write it; the committed file by default.
    """
    path.write_text(render())


if __name__ == "__main__":
    write()
