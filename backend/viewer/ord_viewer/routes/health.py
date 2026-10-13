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

"""The load balancer's health check."""

from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ord_viewer.state import ViewerState, get_state

router = APIRouter(prefix="/api")


class Health(BaseModel):
    """The corpus the process serves."""

    fingerprint: str


@router.get("/health")
async def health(state: Annotated[ViewerState, Depends(get_state)]) -> Health:
    """Return the open corpus's fingerprint.

    The fingerprint is a precomputed string, so the handler never blocks the event
    loop and does not queue behind blocking handlers on the threadpool.

    Args:
        state: The settings and open corpus the lifespan stored on the app.

    Returns:
        The fingerprint of the corpus the process serves.
    """
    return Health(fingerprint=state.corpus.fingerprint)
