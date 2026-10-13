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

"""What the app holds for the life of the process, and the dependency that reads it."""

import dataclasses

from fastapi import Request
from ord_schema.search import execute

from ord_viewer.settings import Settings


@dataclasses.dataclass(frozen=True)
class ViewerState:
    """The settings and the open corpus every route reads."""

    settings: Settings
    corpus: execute.Corpus


async def get_state(request: Request) -> ViewerState:
    """Return the state the lifespan stored on the app.

    It is async so FastAPI resolves it on the event loop, not in a worker thread, and a
    route that is itself async, such as the health check, needs no free thread.

    Args:
        request: The request being served.

    Returns:
        The settings and open corpus.
    """
    return request.app.state.viewer
