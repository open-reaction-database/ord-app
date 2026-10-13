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
import threading
from collections.abc import Generator


class SlotsBusyError(Exception):
    """Every slot stayed taken for as long as a request may wait."""


class SearchSlots:
    """A bounded number of concurrent searches; a request waits a while for one.

    Args:
        capacity: The most searches that may hold a slot at once.
        wait_seconds: How long a request waits for a slot before giving up.
    """

    def __init__(self, capacity: int, wait_seconds: float) -> None:
        self._semaphore = threading.BoundedSemaphore(capacity)
        self._wait_seconds = wait_seconds

    @contextlib.contextmanager
    def hold(self) -> Generator[None]:
        """Hold one slot for the body of the with statement.

        Raises:
            SlotsBusyError: If no slot frees within the wait.
        """
        if not self._semaphore.acquire(timeout=self._wait_seconds):
            raise SlotsBusyError(
                f"every search slot stayed busy for {self._wait_seconds} s; try again"
            )
        try:
            yield
        finally:
            self._semaphore.release()
