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
import { shallowEqualArrays, shallowEqualRecords } from './equality.ts';

describe('shallowEqualArrays', () => {
  const item = { a: 1 };

  it('holds for the same items in the same order', () => {
    expect(shallowEqualArrays([item, 2], [item, 2])).toBe(true);
    expect(shallowEqualArrays([Number.NaN], [Number.NaN])).toBe(true);
  });

  it('fails for a different length, order, or item identity', () => {
    expect(shallowEqualArrays([item], [item, item])).toBe(false);
    expect(shallowEqualArrays([1, 2], [2, 1])).toBe(false);
    expect(shallowEqualArrays([item], [{ a: 1 }])).toBe(false);
  });
});

describe('shallowEqualRecords', () => {
  const value = { a: 1 };

  it('holds for the same keys holding the same values', () => {
    expect(shallowEqualRecords({ x: value, y: 2 }, { y: 2, x: value })).toBe(true);
  });

  it('fails for a different key count, a missing key, or a different value', () => {
    expect(shallowEqualRecords({ x: 1 }, { x: 1, y: 2 })).toBe(false);
    expect(shallowEqualRecords({ x: undefined }, { y: undefined })).toBe(false);
    expect(shallowEqualRecords({ x: value }, { x: { a: 1 } })).toBe(false);
  });
});
