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
import { reactionFormReducer } from './reactionForm.reducer.ts';
import {
  addReactionPathComponentToList,
  clearReactionPathComponentsList,
  popReactionPathComponents,
  setReactionPathComponentsList,
  sliceReactionPathComponentsList,
} from './reactionForm.actions.ts';
import { searchReactionActions } from 'store/entities/reactions/reactions.actions.ts';
import type { DatasetReaction } from 'store/entities/reactions/reactions.types.ts';

const initialState = () => reactionFormReducer(undefined, { type: '@@INIT' });

describe('reactionFormReducer', () => {
  it('starts with an empty path-components list', () => {
    expect(initialState()).toEqual({ reactionPathComponentsList: [] });
  });

  it('replaces the list with set', () => {
    const state = reactionFormReducer(
      initialState(),
      setReactionPathComponentsList([['inputs', 0]]),
    );
    expect(state.reactionPathComponentsList).toEqual([['inputs', 0]]);
  });

  it('appends with add', () => {
    let state = reactionFormReducer(
      initialState(),
      setReactionPathComponentsList([['a']]),
    );
    state = reactionFormReducer(state, addReactionPathComponentToList(['b', 1]));
    expect(state.reactionPathComponentsList).toEqual([['a'], ['b', 1]]);
  });

  it('drops the last entry with pop', () => {
    let state = reactionFormReducer(
      initialState(),
      setReactionPathComponentsList([['a'], ['b'], ['c']]),
    );
    state = reactionFormReducer(state, popReactionPathComponents());
    expect(state.reactionPathComponentsList).toEqual([['a'], ['b']]);
  });

  it('truncates to the given index (inclusive) with slice', () => {
    let state = reactionFormReducer(
      initialState(),
      setReactionPathComponentsList([['a'], ['b'], ['c'], ['d']]),
    );
    state = reactionFormReducer(state, sliceReactionPathComponentsList(1));
    expect(state.reactionPathComponentsList).toEqual([['a'], ['b']]);
  });

  it('resets on clear and on a successful reaction search', () => {
    let state = reactionFormReducer(
      initialState(),
      setReactionPathComponentsList([['a'], ['b']]),
    );
    state = reactionFormReducer(state, clearReactionPathComponentsList());
    expect(state.reactionPathComponentsList).toEqual([]);

    state = reactionFormReducer(
      reactionFormReducer(initialState(), setReactionPathComponentsList([['a']])),
      searchReactionActions.success({} as DatasetReaction),
    );
    expect(state.reactionPathComponentsList).toEqual([]);
  });
});
