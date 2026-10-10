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
import type { ReactionInput } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import { orderInputs } from './orderInputs.ts';

const input = (name: string, additionOrder?: number) =>
  ({ name, additionOrder }) as unknown as ReactionInput;

describe('orderInputs', () => {
  it('sorts by addition order, then by name', () => {
    const ordered = orderInputs({
      c: input('c', 2),
      b: input('b', 1),
      a: input('a', 2),
    });
    expect(ordered.map(item => item.name)).toEqual(['b', 'a', 'c']);
  });

  it('puts inputs without an addition order last, by name', () => {
    const ordered = orderInputs({ z: input('z'), y: input('y'), x: input('x', 5) });
    expect(ordered.map(item => item.name)).toEqual(['x', 'y', 'z']);
  });

  it('returns an empty list for no inputs', () => {
    expect(orderInputs({})).toEqual([]);
  });
});
