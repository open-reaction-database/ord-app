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
import {
  selectReactionById,
  selectReactionPartByPath,
  selectOrderedInputsWrapper,
  selectTemplateVariablesWrapper,
  selectTemplateVariableWrapper,
} from './reactions.selectors.ts';
import type { AppState } from 'store/configureAppStore.ts';

const buildState = (reactionsById: Record<string | number, unknown>): AppState =>
  ({ entities: { reactions: { reactionsById } } }) as unknown as AppState;

describe('selectReactionById', () => {
  it('returns the reaction stored under the id', () => {
    const reaction = { id: 7, name: 'rxn' };
    expect(selectReactionById(7)(buildState({ 7: reaction }))).toBe(reaction);
  });
});

describe('selectReactionPartByPath', () => {
  it('returns null when the reaction is missing', () => {
    expect(selectReactionPartByPath(404, ['inputs'])(buildState({}))).toBeNull();
  });
});

describe('selectOrderedInputs', () => {
  it('sorts by additionOrder, then by name as a tiebreaker', () => {
    const state = buildState({
      r: {
        data: {
          inputs: {
            a: { name: 'b', additionOrder: 2 },
            b: { name: 'a', additionOrder: 2 },
            c: { name: 'c', additionOrder: 1 },
            d: { name: 'z' }, // no additionOrder -> sorts last (Infinity)
          },
        },
      },
    });
    expect(selectOrderedInputsWrapper('r')(state).map(input => input.name)).toEqual(['c', 'a', 'b', 'z']);
  });

  it('returns an empty array when the reaction has no inputs', () => {
    expect(selectOrderedInputsWrapper('missing')(buildState({})).length).toBe(0);
  });
});

describe('template variable selectors', () => {
  const state = buildState({ t: { variables: { v1: { name: 'v1', value: 1 }, v2: { name: 'v2', value: 2 } } } });

  it('selectTemplateVariables returns the whole variables map', () => {
    expect(Object.keys(selectTemplateVariablesWrapper('t')(state))).toEqual(['v1', 'v2']);
  });

  it('selectTemplateVariable returns a single named variable', () => {
    expect(selectTemplateVariableWrapper('t', 'v2')(state)).toEqual({ name: 'v2', value: 2 });
  });
});
