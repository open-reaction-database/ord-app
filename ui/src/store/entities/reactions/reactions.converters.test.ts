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
import { convertReactionFloatsToDoubles } from './reactions.converters.ts';

describe('convertReactionFloatsToDoubles', () => {
  it('rounds floats to 7 significant figures in place', () => {
    const part = { value: 1.123456789 };
    convertReactionFloatsToDoubles(part);
    expect(part.value).toBe(1.123457);
  });

  it('leaves integers unchanged', () => {
    const part = { count: 42 };
    convertReactionFloatsToDoubles(part);
    expect(part.count).toBe(42);
  });

  it('recurses into nested objects and objects within arrays', () => {
    const part = { outer: { inner: 2.000000123 }, list: [{ x: 3.000000456 }] };
    convertReactionFloatsToDoubles(part);
    expect(part.outer.inner).toBe(2);
    expect(part.list[0].x).toBe(3);
  });

  it('leaves bare numeric array elements untouched (only object properties are rounded)', () => {
    const part = { values: [1.123456789] };
    convertReactionFloatsToDoubles(part);
    expect(part.values[0]).toBe(1.123456789);
  });

  it('leaves non-numeric values untouched', () => {
    const part = { name: 'ethanol', flag: true };
    convertReactionFloatsToDoubles(part);
    expect(part).toEqual({ name: 'ethanol', flag: true });
  });

  it('is a no-op for null or non-object input', () => {
    expect(() => convertReactionFloatsToDoubles(null)).not.toThrow();
    expect(() => convertReactionFloatsToDoubles(5)).not.toThrow();
  });
});
