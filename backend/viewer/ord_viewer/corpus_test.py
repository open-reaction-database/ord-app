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

"""Reading reactions from the corpus."""

import pyarrow as pa
import pytest
from ord_schema.search import execute

from ord_viewer.corpus import read_reactions


def test_unknown_ids_are_an_empty_table_with_the_record_schema(client):
    corpus = client.app.state.viewer.corpus
    known = read_reactions(corpus, ["ord-viewer0101"])
    unknown = read_reactions(corpus, ["ord-unknown"])
    assert known.num_rows == 1
    assert unknown.num_rows == 0
    assert unknown.schema == known.schema


def test_another_arrow_failure_propagates(client, monkeypatch):
    def _fail(self, reaction_ids):
        if not reaction_ids:
            return pa.table({})
        raise pa.ArrowNotImplementedError("some other kernel is missing")

    monkeypatch.setattr(execute.Corpus, "reactions", _fail)
    corpus = client.app.state.viewer.corpus
    with pytest.raises(pa.ArrowNotImplementedError, match="some other kernel"):
        read_reactions(corpus, ["ord-viewer0101"])
