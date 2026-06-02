/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, it, expect } from 'vitest';
import { createEmptyReactionInput } from './reactionInputs.utils.ts';

describe('createEmptyReactionInput', () => {
  it('builds a named input with empty component lists', () => {
    const input = createEmptyReactionInput('Reagent');
    expect(input.name).toBe('Reagent');
    expect(Array.isArray(input.components)).toBe(true);
    expect(input.components).toHaveLength(0);
    expect(Array.isArray(input.crudeComponents)).toBe(true);
    expect(input.crudeComponents).toHaveLength(0);
  });
});
