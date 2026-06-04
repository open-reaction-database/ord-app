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
import { describe, it, expect } from 'vitest';
import { createConditionFactory } from 'features/reactions/ReactionEntities/reactionEntities.utils.ts';

describe('createConditionFactory', () => {
  it('builds a "type" condition that hides when the value is not in the allowed set', () => {
    const condition = createConditionFactory<string>()(['a', 'b']);
    expect(condition?.name).toBe('type');
    expect(condition?.isHidden('a')).toBe(false);
    expect(condition?.isHidden('b')).toBe(false);
    expect(condition?.isHidden('c')).toBe(true);
  });

  it('hides everything for an empty allowed set', () => {
    const condition = createConditionFactory<number>()([]);
    expect(condition?.isHidden(1)).toBe(true);
  });
});
