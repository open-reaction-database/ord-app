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
import { reversePrimitiveRecord } from './reversePrimitiveRecord.ts';

describe('reversePrimitiveRecord', () => {
  it('swaps keys and values', () => {
    expect(reversePrimitiveRecord({ a: 1, b: 2 })).toEqual({ 1: 'a', 2: 'b' });
  });

  it('returns an empty record for an empty input', () => {
    expect(reversePrimitiveRecord({})).toEqual({});
  });

  it('reverses string-to-string records', () => {
    expect(reversePrimitiveRecord({ celsius: 'c', fahrenheit: 'f' })).toEqual({
      c: 'celsius',
      f: 'fahrenheit',
    });
  });

  it('keeps the last key when two keys share a value', () => {
    expect(reversePrimitiveRecord({ a: 1, b: 1 })).toEqual({ 1: 'b' });
  });
});
