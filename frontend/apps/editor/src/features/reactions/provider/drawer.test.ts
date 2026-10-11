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
import { drawerReducer, EMPTY_DRAWER_STACK } from './drawer.ts';

describe('drawerReducer', () => {
  it('replaces the stack with set', () => {
    expect(
      drawerReducer(EMPTY_DRAWER_STACK, { type: 'set', stack: [['inputs', 0]] }),
    ).toEqual([['inputs', 0]]);
  });

  it('appends with push', () => {
    const stack = drawerReducer([['a']], { type: 'push', pathComponents: ['b', 1] });
    expect(stack).toEqual([['a'], ['b', 1]]);
  });

  it('drops the last entry with pop, and leaves an empty stack empty', () => {
    expect(drawerReducer([['a'], ['b'], ['c']], { type: 'pop' })).toEqual([
      ['a'],
      ['b'],
    ]);
    expect(drawerReducer(EMPTY_DRAWER_STACK, { type: 'pop' })).toEqual([]);
  });

  it('keeps the entries up to the index, inclusive, with truncate', () => {
    const stack = drawerReducer([['a'], ['b'], ['c'], ['d']], {
      type: 'truncate',
      index: 1,
    });
    expect(stack).toEqual([['a'], ['b']]);
  });

  it('empties the stack with clear', () => {
    expect(drawerReducer([['a']], { type: 'clear' })).toBe(EMPTY_DRAWER_STACK);
  });
});
