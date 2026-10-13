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

from collections.abc import Generator

import pytest
from ord_schema import resolvers

from ord_viewer.corpus import resolve_compound_name


@pytest.fixture
def fresh_resolver_cache() -> Generator[None]:
    """Empty the resolver cache before and after the test."""
    resolve_compound_name.cache_clear()
    yield
    resolve_compound_name.cache_clear()


def test_caches_names_that_resolve_and_retries_names_that_do_not(
    monkeypatch, fresh_resolver_cache
):
    asked = []

    def resolve_name(value_type, value):
        asked.append(value)
        if value == "pyridine":
            return "c1ccncc1", "test"
        raise ValueError(f"Could not resolve {value_type} {value} to SMILES")

    monkeypatch.setattr(resolvers, "resolve_name", resolve_name)
    assert resolve_compound_name("pyridine") == "c1ccncc1"
    assert resolve_compound_name("pyridine") == "c1ccncc1"
    for _ in range(2):
        with pytest.raises(ValueError):
            resolve_compound_name("unobtainium")
    assert asked == ["pyridine", "unobtainium", "unobtainium"]
