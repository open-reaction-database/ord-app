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
import { convertObjectToUndefinedIfEmpty } from './convertObjectToUndefinedIfEmpty.ts';

describe('convertObjectToUndefinedIfEmpty', () => {
  it('returns undefined when every value is empty (undefined/null/"")', () => {
    expect(
      convertObjectToUndefinedIfEmpty({ a: '', b: null, c: undefined }),
    ).toBeUndefined();
  });

  it('returns the object when any value is non-empty', () => {
    const object = { a: 'x', b: '' };
    expect(convertObjectToUndefinedIfEmpty(object)).toBe(object);
  });

  it('treats an enum key set to the unspecified value (0) as empty', () => {
    expect(convertObjectToUndefinedIfEmpty({ type: 0 }, ['type'])).toBeUndefined();
  });

  it('keeps a 0-valued key that is not declared as an enum key', () => {
    const object = { type: 0 };
    expect(convertObjectToUndefinedIfEmpty(object)).toBe(object);
  });
});
