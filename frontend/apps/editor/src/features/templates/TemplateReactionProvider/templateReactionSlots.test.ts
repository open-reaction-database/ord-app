/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, expect, it } from 'vitest';
import { TEMPLATE_SLOTS } from './templateReactionSlots.ts';

describe('TEMPLATE_SLOTS', () => {
  it('link no crude component to a search, since a template belongs to no dataset', () => {
    // Without the slot, the view shows the reaction id as text.
    expect(TEMPLATE_SLOTS.ReactionLink).toBeUndefined();
  });
});
