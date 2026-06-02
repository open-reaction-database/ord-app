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
import {
  convertObjectToNullIfEmpty,
  deepMergeWithArrayMerge,
  generateDeepPartialReactionByPath,
  getDeepReactionPart,
  removeDeepReactionPart,
} from './reactions.utils.ts';

describe('generateDeepPartialReactionByPath', () => {
  it('returns the value directly for an empty path', () => {
    expect(generateDeepPartialReactionByPath([], 'value')).toBe('value');
  });

  it('nests the value under string path components', () => {
    expect(generateDeepPartialReactionByPath(['a'], 1)).toEqual({ a: 1 });
    expect(generateDeepPartialReactionByPath(['a', 'b'], 1)).toEqual({ a: { b: 1 } });
  });

  it('creates arrays for numeric path components', () => {
    expect(generateDeepPartialReactionByPath(['inputs', 0], 'x')).toEqual({ inputs: ['x'] });
  });
});

describe('getDeepReactionPart', () => {
  it('reads the value at the given path', () => {
    expect(getDeepReactionPart({ a: { b: 1 } }, ['a', 'b'])).toBe(1);
    expect(getDeepReactionPart({ items: [10, 20] }, ['items', 1])).toBe(20);
  });

  it('returns the whole object for an empty path', () => {
    const reaction = { a: 1 };
    expect(getDeepReactionPart(reaction, [])).toBe(reaction);
  });

  it('returns null when the path runs through a missing branch', () => {
    expect(getDeepReactionPart({}, ['missing', 'deeper'])).toBeNull();
  });
});

describe('removeDeepReactionPart', () => {
  it('removes a top-level string key', () => {
    expect(removeDeepReactionPart({ a: 1, b: 2 }, ['a'])).toEqual({ b: 2 });
  });

  it('removes an array element by numeric index', () => {
    expect(removeDeepReactionPart([10, 20, 30], [1])).toEqual([10, 30]);
  });

  it('removes a nested key without touching siblings', () => {
    expect(removeDeepReactionPart({ a: { b: 1, c: 2 } }, ['a', 'b'])).toEqual({ a: { c: 2 } });
  });

  it('removes a nested array element', () => {
    expect(removeDeepReactionPart({ items: [10, 20, 30] }, ['items', 1])).toEqual({ items: [10, 30] });
  });
});

describe('convertObjectToNullIfEmpty', () => {
  it('returns null when every value is empty (undefined/null/"")', () => {
    expect(convertObjectToNullIfEmpty({ a: '', b: null, c: undefined })).toBeNull();
  });

  it('returns the object when any value is non-empty', () => {
    const object = { a: 'x', b: '' };
    expect(convertObjectToNullIfEmpty(object)).toBe(object);
  });

  it('treats an enum key set to the unspecified value (0) as empty', () => {
    expect(convertObjectToNullIfEmpty({ type: 0 }, ['type'])).toBeNull();
  });

  it('keeps a 0-valued key that is not declared as an enum key', () => {
    const object = { type: 0 };
    expect(convertObjectToNullIfEmpty(object)).toBe(object);
  });
});

describe('deepMergeWithArrayMerge', () => {
  it('deep-merges nested objects, keeping keys from both sides', () => {
    expect(deepMergeWithArrayMerge({ a: { x: 1 }, b: 1 }, { a: { y: 2 } })).toEqual({ a: { x: 1, y: 2 }, b: 1 });
  });

  it('merges arrays element-wise by index rather than concatenating', () => {
    expect(deepMergeWithArrayMerge([{ a: 1 }, { a: 2 }], [{ b: 9 }])).toEqual([{ a: 1, b: 9 }, { a: 2 }]);
  });

  it('replaces a primitive array element at the same index', () => {
    expect(deepMergeWithArrayMerge([1, 2, 3], [9])).toEqual([9, 2, 3]);
  });

  it('skips falsy source items, preserving the target element at that index', () => {
    expect(deepMergeWithArrayMerge([{ a: 1 }, { a: 2 }], [null, { b: 9 }])).toEqual([{ a: 1 }, { a: 2, b: 9 }]);
  });

  it('appends a new element when the target has no value at that index', () => {
    expect(deepMergeWithArrayMerge([], [{ x: 1 }])).toEqual([{ x: 1 }]);
  });

  it('does not mutate the target operand', () => {
    const target = { a: { x: 1 }, list: [{ k: 1 }] };
    deepMergeWithArrayMerge(target, { a: { y: 2 }, list: [{ j: 2 }] });
    expect(target).toEqual({ a: { x: 1 }, list: [{ k: 1 }] });
  });
});
