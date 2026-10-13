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

"""The cap on searches in flight."""

import anyio
import pytest
from anyio.abc import TaskStatus

from ord_viewer.slots import SearchSlots, SlotsBusyError


@pytest.mark.anyio
async def test_waits_for_a_slot_to_free():
    slots = SearchSlots(capacity=1, wait_seconds=5)
    released = anyio.Event()

    async def hold_briefly(*, task_status: TaskStatus[None]) -> None:
        async with slots.hold():
            task_status.started()
            await anyio.sleep(0.1)
        released.set()

    async with anyio.create_task_group() as group:
        await group.start(hold_briefly)
        async with slots.hold():
            assert released.is_set()


@pytest.mark.anyio
async def test_waits_then_refuses_when_full():
    slots = SearchSlots(capacity=1, wait_seconds=0.01)
    async with slots.hold():
        # Only the inner hold sits inside pytest.raises, so only it can raise.
        with pytest.raises(SlotsBusyError, match="every search slot stayed busy"):
            async with slots.hold():
                pass


@pytest.mark.anyio
async def test_frees_a_slot_when_the_body_raises():
    slots = SearchSlots(capacity=1, wait_seconds=0.01)
    with pytest.raises(RuntimeError, match="search failed"):
        async with slots.hold():
            raise RuntimeError("search failed")
    async with slots.hold():
        pass


@pytest.mark.anyio
async def test_a_timeout_in_the_body_is_not_a_busy_slot():
    slots = SearchSlots(capacity=1, wait_seconds=5)
    with pytest.raises(TimeoutError, match="the search ran long"):
        async with slots.hold():
            raise TimeoutError("the search ran long")
    async with slots.hold():
        pass
