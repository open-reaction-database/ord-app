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
import { findReactionEntityUniqueName } from './findReactionEntityUniqueName.ts';

describe('findReactionEntityUniqueName', () => {
  it('returns the first numbered name when none are taken', () => {
    expect(findReactionEntityUniqueName('Reagent', [])).toBe('Reagent 1');
  });

  it('skips taken names and returns the next available counter', () => {
    expect(findReactionEntityUniqueName('Reagent', ['Reagent 1', 'Reagent 2'])).toBe(
      'Reagent 3',
    );
  });

  it('fills the first gap rather than always appending at the end', () => {
    expect(findReactionEntityUniqueName('Reagent', ['Reagent 2', 'Reagent 3'])).toBe(
      'Reagent 1',
    );
  });

  it('ignores unrelated names', () => {
    expect(findReactionEntityUniqueName('Reagent', ['Solvent 1', 'Catalyst 1'])).toBe(
      'Reagent 1',
    );
  });

  it('omits the space when includeSpace is false', () => {
    expect(findReactionEntityUniqueName('Reagent', ['Reagent1'], false)).toBe(
      'Reagent2',
    );
  });
});
