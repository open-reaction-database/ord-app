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
import { reactionLookupReducer } from './reactionLookup.reducer.ts';
import {
  resetReactionLookupErrorAction,
  setReactionLookupOpenedAction,
} from './reactionLookup.actions.ts';
import { addIdentifierByNameActions } from 'store/entities/reactions/reactionsInputs/reactionInputs.actions.ts';

const initialState = () => reactionLookupReducer(undefined, { type: '@@INIT' });

describe('reactionLookupReducer', () => {
  it('starts closed, not loading, without error', () => {
    expect(initialState()).toEqual({
      isOpened: false,
      isLoading: false,
      hasError: false,
    });
  });

  describe('isOpened', () => {
    it('follows the open action and closes once an identifier is added', () => {
      let state = reactionLookupReducer(
        initialState(),
        setReactionLookupOpenedAction(true),
      );
      expect(state.isOpened).toBe(true);
      state = reactionLookupReducer(state, addIdentifierByNameActions.success());
      expect(state.isOpened).toBe(false);
    });
  });

  describe('isLoading', () => {
    it('is true while the lookup request is pending', () => {
      let state = reactionLookupReducer(
        initialState(),
        addIdentifierByNameActions.request({} as never),
      );
      expect(state.isLoading).toBe(true);
      state = reactionLookupReducer(state, addIdentifierByNameActions.success());
      expect(state.isLoading).toBe(false);

      state = reactionLookupReducer(
        initialState(),
        addIdentifierByNameActions.request({} as never),
      );
      state = reactionLookupReducer(state, addIdentifierByNameActions.failure());
      expect(state.isLoading).toBe(false);
    });
  });

  describe('hasError', () => {
    it('is set on failure and cleared on reset', () => {
      let state = reactionLookupReducer(
        initialState(),
        addIdentifierByNameActions.failure(),
      );
      expect(state.hasError).toBe(true);
      state = reactionLookupReducer(state, resetReactionLookupErrorAction());
      expect(state.hasError).toBe(false);
    });
  });
});
