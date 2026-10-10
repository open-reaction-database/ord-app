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
import { variablesSidebarReducer } from './variablesSidebar.reducer.ts';
import { setVariablesSidebarOpenedAction } from './variablesSidebar.actions.ts';
import {
  addReactionPathComponentToList,
  setReactionPathComponentsList,
} from '../reactionForm/reactionForm.actions.ts';

const initialState = () => variablesSidebarReducer(undefined, { type: '@@INIT' });

describe('variablesSidebarReducer', () => {
  it('starts closed', () => {
    expect(initialState()).toEqual({ isVariablesSidebarOpened: false });
  });

  it('follows the open action', () => {
    const state = variablesSidebarReducer(
      initialState(),
      setVariablesSidebarOpenedAction(true),
    );
    expect(state.isVariablesSidebarOpened).toBe(true);
  });

  it('closes when the reaction path changes (set or add)', () => {
    let state = variablesSidebarReducer(
      initialState(),
      setVariablesSidebarOpenedAction(true),
    );
    state = variablesSidebarReducer(state, setReactionPathComponentsList([['a']]));
    expect(state.isVariablesSidebarOpened).toBe(false);

    state = variablesSidebarReducer(
      variablesSidebarReducer(initialState(), setVariablesSidebarOpenedAction(true)),
      addReactionPathComponentToList(['b']),
    );
    expect(state.isVariablesSidebarOpened).toBe(false);
  });
});
