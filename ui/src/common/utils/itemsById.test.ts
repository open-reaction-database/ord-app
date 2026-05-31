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
import { itemsById } from './itemsById.ts';

describe('itemsById', () => {
  it('keys each item by the value returned from the id getter', () => {
    const items = [
      { id: 'a', value: 1 },
      { id: 'b', value: 2 },
    ];
    expect(itemsById(items, item => item.id)).toEqual({
      a: { id: 'a', value: 1 },
      b: { id: 'b', value: 2 },
    });
  });

  it('returns an empty record for an empty array', () => {
    expect(itemsById([], (item: { id: string }) => item.id)).toEqual({});
  });

  it('supports numeric ids', () => {
    const items = [
      { id: 1, name: 'one' },
      { id: 2, name: 'two' },
    ];
    expect(itemsById(items, item => item.id)).toEqual({
      1: { id: 1, name: 'one' },
      2: { id: 2, name: 'two' },
    });
  });

  it('keeps the last item when two share an id', () => {
    const items = [
      { id: 'a', value: 1 },
      { id: 'a', value: 2 },
    ];
    expect(itemsById(items, item => item.id)).toEqual({ a: { id: 'a', value: 2 } });
  });
});
