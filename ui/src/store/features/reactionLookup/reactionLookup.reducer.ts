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
import { combineReducers, createReducer, isAnyOf } from '@reduxjs/toolkit';
import { addIdentifierByNameActions } from 'store/entities/reactions/reactionsInputs/reactionInputs.actions.ts';
import { setReactionLookupOpenedAction, resetReactionLookupErrorAction } from './reactionLookup.actions.ts';

const isOpened = createReducer(false, builder => {
  builder.addCase(setReactionLookupOpenedAction, (_, action) => action.payload);
  builder.addCase(addIdentifierByNameActions.success, () => false);
});

const isLoading = createReducer(false, builder => {
  builder.addCase(addIdentifierByNameActions.request, () => true);
  builder.addMatcher(isAnyOf(addIdentifierByNameActions.success, addIdentifierByNameActions.failure), () => false);
});

const hasError = createReducer(false, builder => {
  builder.addCase(addIdentifierByNameActions.failure, () => true);
  builder.addCase(resetReactionLookupErrorAction, () => false);
});

export const reactionLookupReducer = combineReducers({
  isOpened,
  isLoading,
  hasError,
});
