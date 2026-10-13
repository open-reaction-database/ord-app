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

"""Settings for the viewer's backend, read from ORD_VIEWER_* environment variables."""

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Where the corpus lives and how the service uses it."""

    model_config = SettingsConfigDict(
        env_prefix="ORD_VIEWER_",
        # An empty variable counts as unset.
        env_ignore_empty=True,
    )

    # A root holding projections/, structures/, pivots/, occurrences/, and sources/.
    corpus_dir: Path | None = None
    # DuckDB's memory_limit, such as "6500MiB"; DuckDB's default when unset.
    memory_limit: str | None = None
    # The searches expected in flight at once; each gets cores / max_concurrent RDKit
    # threads.
    max_concurrent: int = Field(default=4, ge=1)
    # The bound on one search, passed to Corpus.search; a search past it answers 504.
    search_timeout_seconds: float = Field(default=30.0, gt=0)
    # How long a request waits for a free search slot before answering 503.
    slot_wait_seconds: float = Field(default=10.0, gt=0)
