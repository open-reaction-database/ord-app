/*
 * Copyright 2024 Open Reaction Database Project Authors
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
import { combineReducers, createReducer } from '@reduxjs/toolkit';
import type { EnumerationProgress } from './enumeration.types.ts';
import { enumerateBatchActions, startEnumerationActions } from './enumeration.actions.ts';

const enumerationProgress = createReducer<null | EnumerationProgress>(null, builder => {
  builder.addCase(startEnumerationActions, (_, action) => ({
    ...action.payload,
    reactions: [],
    errors: [],
    index: 0,
  }));
  builder.addCase(enumerateBatchActions.success, (state, { payload }) => {
    if (state === null) {
      return state;
    }
    const { reactions, errors } = payload;
    return {
      ...state,
      reactions: state.reactions.concat(reactions),
      errors: state.errors.concat(errors),
      index: state.index + reactions.length + errors.length,
    };
  });
});

export const enumerationReducer = combineReducers({
  enumerationProgress,
});
