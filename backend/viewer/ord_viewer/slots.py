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

"""A cap on searches in flight, since each one can hold the corpus's CPUs."""

import contextlib
from collections.abc import AsyncGenerator

import anyio


class SlotsBusyError(Exception):
    """Every slot stayed taken for as long as a request may wait."""


class SearchSlots:
    """A bounded number of concurrent searches; a request waits a while for one.

    A request waits on the event loop, so a waiting request holds no worker thread.

    Args:
        capacity: The most searches that may hold a slot at once.
        wait_seconds: How long a request waits for a slot before giving up.
    """

    def __init__(self, capacity: int, wait_seconds: float) -> None:
        self._semaphore = anyio.Semaphore(capacity, max_value=capacity)
        self._wait_seconds = wait_seconds

    def waiting(self) -> int:
        """Return how many requests are waiting for a slot; call it on the event loop."""
        return self._semaphore.statistics().tasks_waiting

    @contextlib.asynccontextmanager
    async def hold(self) -> AsyncGenerator[None]:
        """Hold one slot for the body of the async with statement.

        Raises:
            SlotsBusyError: If no slot frees within the wait.
        """
        try:
            with anyio.fail_after(self._wait_seconds):
                await self._semaphore.acquire()
        except TimeoutError:
            raise SlotsBusyError(
                f"every search slot stayed busy for {self._wait_seconds} s; try again"
            ) from None
        try:
            yield
        finally:
            self._semaphore.release()
