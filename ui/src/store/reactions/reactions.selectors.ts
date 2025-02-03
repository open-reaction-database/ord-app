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
import type { AppState } from '../configureAppStore';
import { createSelector } from '@reduxjs/toolkit';

const selectRoot = (state: AppState) => state.reactions;

export const selectReactionsOrder = (state: AppState) => selectRoot(state).reactionsOrder;

export const selectReactionsByIds = (state: AppState) => selectRoot(state).reactionsById;

export const selectReactionsList = createSelector(
  [selectReactionsByIds, selectReactionsOrder],
  (reactionsByIds, reactionsOrder) => reactionsOrder.map(id => reactionsByIds[id]),
);

export const selectReactionById = (id: number) => (state: AppState) => selectRoot(state).reactionsById[id];

export const selectReactionsPagination = (state: AppState) => selectRoot(state).pagination;

export const selectActiveDatasetId = (state: AppState) => selectRoot(state).activeDatasetId;

export const selectIsReactionCreating = (state: AppState) => selectRoot(state).isReactionCreating;
