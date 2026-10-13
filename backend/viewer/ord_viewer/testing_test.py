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

"""The command that derives the test corpus for the image's smoke test."""

import pytest

from ord_viewer.testing import main, make_client


def test_main_derives_a_corpus_the_app_serves(tmp_path):
    main([str(tmp_path / "corpus")])
    with make_client(tmp_path / "corpus") as client:
        assert client.get("/api/reactions/ord-viewer0101").status_code == 200


def test_main_derives_into_an_empty_directory_that_exists(tmp_path):
    main([str(tmp_path)])
    assert (tmp_path / "pivots").is_dir()


def test_main_refuses_a_directory_that_holds_files(tmp_path):
    (tmp_path / "notes.txt").write_text("")
    with pytest.raises(ValueError, match="is not empty"):
        main([str(tmp_path)])
