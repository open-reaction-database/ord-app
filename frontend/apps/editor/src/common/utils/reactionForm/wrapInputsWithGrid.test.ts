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
import { wrapInputsWithGrid } from './wrapInputsWithGrid.ts';
import {
  ReactionFormNodeType,
  type ReactionFormNode,
} from 'features/reactions/ReactionEntities/reactionEntities.types.ts';

const node = (name: string): ReactionFormNode =>
  ({ type: ReactionFormNodeType.value, name }) as ReactionFormNode;

describe('wrapInputsWithGrid', () => {
  it('wraps inputs in a grid whose column count is the number of fields', () => {
    const a = node('a');
    const b = node('b');
    expect(wrapInputsWithGrid(a, b)).toEqual({
      type: ReactionFormNodeType.wrapper,
      grid: 2,
      fields: [a, b],
    });
  });

  it('handles a single input', () => {
    const a = node('a');
    expect(wrapInputsWithGrid(a)).toMatchObject({ grid: 1, fields: [a] });
  });

  it('handles no inputs', () => {
    expect(wrapInputsWithGrid()).toMatchObject({ grid: 0, fields: [] });
  });
});
