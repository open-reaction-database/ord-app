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
import {
  createEmptyReactionActions,
  getReactionActions,
  getReactionPageActions,
  getReactionsListActions,
  importReactionFromFileActions,
  renameReactionActions,
  updateReactionActions,
} from './reactions.actions';
import { itemsById } from 'common/utils';
import type { ReactionWrapper } from './reactions.types';
import type { ItemsById, Pagination } from 'common/types';
import { emptyPagination } from 'common/constants';

const getReactionId = (reaction: ReactionWrapper) => reaction.id;

const activeDatasetId = createReducer<number>(0, builder => {
  builder.addCase(getReactionActions.request, (_, action) => action.payload.datasetId);
  builder.addCase(getReactionsListActions.request, (_, action) => action.payload);
});

const reactionsById = createReducer<ItemsById<ReactionWrapper>>({}, builder => {
  builder.addMatcher(
    isAnyOf(
      getReactionActions.success,
      renameReactionActions.success,
      createEmptyReactionActions.success,
      importReactionFromFileActions.success,
      updateReactionActions.success,
    ),
    (state, action) => ({
      ...state,
      [getReactionId(action.payload)]: action.payload,
    }),
  );
  builder.addMatcher(isAnyOf(getReactionsListActions.success, getReactionPageActions.success), (_, action) =>
    itemsById(action.payload.items, getReactionId),
  );
});

const reactionsOrder = createReducer<number[]>([], builder => {
  builder.addCase(getReactionsListActions.request, () => []);
  builder.addMatcher(isAnyOf(getReactionsListActions.request, getReactionPageActions.request), () => []);
  builder.addMatcher(isAnyOf(getReactionsListActions.success, getReactionPageActions.success), (_, action) =>
    action.payload.items.map(getReactionId),
  );
});

const pagination = createReducer<Pagination>(emptyPagination, builder => {
  builder.addCase(getReactionsListActions.request, () => emptyPagination);
  builder.addCase(getReactionPageActions.request, (state, action) => ({ ...state, ...action.payload }));
  builder.addMatcher(isAnyOf(getReactionsListActions.success, getReactionPageActions.success), (state, action) => ({
    ...state,
    total: action.payload.total,
    pages: action.payload.pages,
  }));
  builder.addMatcher(isAnyOf(createEmptyReactionActions.success, importReactionFromFileActions.success), state => ({
    ...state,
    total: state.total + 1,
    pages: Math.ceil((state.total + 1) / state.size),
  }));
});

const isReactionCreating = createReducer<boolean>(false, builder => {
  builder.addMatcher(isAnyOf(createEmptyReactionActions.request, importReactionFromFileActions.request), () => true);
  builder.addMatcher(
    isAnyOf(
      createEmptyReactionActions.success,
      createEmptyReactionActions.failure,
      importReactionFromFileActions.success,
      importReactionFromFileActions.failure,
    ),
    () => false,
  );
});

export const reactionsReducer = combineReducers({
  reactionsById,
  reactionsOrder,
  pagination,
  activeDatasetId,
  isReactionCreating,
});
