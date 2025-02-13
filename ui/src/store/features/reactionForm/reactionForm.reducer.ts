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
import {
  addReactionPathComponentToList,
  clearReactionPathComponentsList,
  popReactionPathComponents,
  setReactionPathComponentsList,
  sliceReactionPathComponentsList,
} from './reactionForm.actions.ts';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';

const defaultReactionPathComponentsList: Array<ReactionPathComponents> = [];

const reactionPathComponentsList = createReducer(defaultReactionPathComponentsList, builder => {
  builder.addCase(setReactionPathComponentsList, (_, action) => action.payload);
  builder.addCase(addReactionPathComponentToList, (state, action) => state.concat([action.payload]));
  builder.addCase(popReactionPathComponents, state => state.slice(0, state.length - 1));
  builder.addCase(sliceReactionPathComponentsList, (state, action) => state.slice(0, action.payload + 1));
  builder.addCase(clearReactionPathComponentsList, () => defaultReactionPathComponentsList);
});

export const reactionFormReducer = combineReducers({
  reactionPathComponentsList,
});
