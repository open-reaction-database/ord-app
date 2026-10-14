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

"""Print the viewer's fixture records as a TypeScript module.

Run from backend/viewer, whose environment and directory hold ord_viewer:

    PYTHONPATH=. uv run python ../../frontend/apps/viewer/scripts/fixture-records.py \
        > ../../frontend/apps/viewer/src/test/fixtures/records.ts

then format the module with Prettier. Each record is GET /api/reactions's answer for
one of the fixture corpus's reactions.
"""

import json
import pathlib
import tempfile

from ord_viewer.testing import derive_corpus, make_client

REACTION_IDS = ("ord-viewer0101", "ord-viewer0102", "ord-viewer0103")


def main() -> None:
    """Derive the fixture corpus and print its records as exported constants."""
    with tempfile.TemporaryDirectory() as directory:
        root = pathlib.Path(directory)
        derive_corpus(root)
        with make_client(root) as client:
            params = [("id", reaction_id) for reaction_id in REACTION_IDS]
            response = client.get("/api/reactions", params=params)
            response.raise_for_status()
            records = response.json()
    print("// Written by scripts/fixture-records.py; regenerate rather than edit.")
    print("import type { ReactionRecord } from '#api/types.ts';")
    for record in records:
        name = record["reaction_id"].removeprefix("ord-").upper()
        print(f"\nexport const {name}: ReactionRecord = {json.dumps(record)};")


if __name__ == "__main__":
    main()
