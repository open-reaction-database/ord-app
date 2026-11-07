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

from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["health"])


class Health(BaseModel):
    """The process is up and answering requests."""

    status: Literal["ok"] = "ok"


@router.get("/health")
async def health() -> Health:
    """Answers the load balancer's health check.

    It reads neither the database nor the caller's login, so a check passes whenever
    uvicorn answers. It is async, so it runs on the event loop and needs no worker
    thread.

    Returns:
        A fixed body that says the process is up.
    """
    return Health()
