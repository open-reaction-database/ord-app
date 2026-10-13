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

import pytest

from ord_viewer.slots import SearchSlots, SlotsBusyError


def test_waits_then_refuses_when_full():
    slots = SearchSlots(capacity=1, wait_seconds=0.01)
    # The outer hold is entered before pytest.raises, so only the inner one can raise.
    with slots.hold(), pytest.raises(SlotsBusyError), slots.hold():
        pass


def test_frees_a_slot_when_the_body_raises():
    slots = SearchSlots(capacity=1, wait_seconds=0.01)
    with pytest.raises(RuntimeError), slots.hold():
        raise RuntimeError("search failed")
    with slots.hold():
        pass
