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


import pytest
from pydantic import ValidationError

from ord_viewer.settings import Settings


def test_refuses_one_revision_without_the_other(tmp_path):
    with pytest.raises(ValidationError, match="set together or not at all"):
        Settings(corpus_dir=tmp_path, artifacts_revision="commit")
    with pytest.raises(ValidationError, match="set together or not at all"):
        Settings(corpus_dir=tmp_path, sources_revision="commit")


def test_accepts_both_revisions_or_neither(tmp_path):
    Settings(corpus_dir=tmp_path)
    Settings(
        corpus_dir=tmp_path, artifacts_revision="commit", sources_revision="commit"
    )
