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
import type { ItemsById, Pagination } from 'common/types';
import type { Dataset } from './datasets.types';
import {
  createEmptyDatasetActions,
  getDatasetActions,
  getDatasetPageActions,
  getGroupsInitialDatasetListActions,
} from './datasets.actions';
import { itemsById } from 'common/utils';
import { emptyPagination } from 'common/constants';
import { setActiveGroupIdAction } from '../groups/groups.actions';

const getDatasetId = (dataset: Dataset) => dataset.id;

const areDatasetsLoading = createReducer<boolean>(false, builder => {
  builder.addCase(setActiveGroupIdAction, () => true);
  builder.addMatcher(isAnyOf(getGroupsInitialDatasetListActions.request, getDatasetPageActions.request), () => true);
  builder.addMatcher(
    isAnyOf(
      getGroupsInitialDatasetListActions.success,
      getGroupsInitialDatasetListActions.failure,
      getDatasetPageActions.success,
      getDatasetPageActions.failure,
    ),
    () => false,
  );
});

const isDatasetCreating = createReducer<boolean>(false, builder => {
  builder.addMatcher(isAnyOf(createEmptyDatasetActions.request), () => true);
  builder.addMatcher(isAnyOf(createEmptyDatasetActions.success, createEmptyDatasetActions.failure), () => false);
})

const datasetsById = createReducer<ItemsById<Dataset>>({}, builder => {
  builder.addCase(getDatasetActions.success, (state, action) => ({
    ...state,
    [getDatasetId(action.payload)]: action.payload,
  }));
  builder.addMatcher(isAnyOf(createEmptyDatasetActions.success), (state, action) => ({
    ...state,
    [getDatasetId(action.payload)]: action.payload,
  }));
  builder.addMatcher(isAnyOf(getGroupsInitialDatasetListActions.success, getDatasetPageActions.success), (_, action) =>
    itemsById(action.payload.items, getDatasetId),
  );
});

const datasetsOrder = createReducer<number[]>([], builder => {
  builder.addCase(setActiveGroupIdAction, () => []);
  builder.addMatcher(isAnyOf(getGroupsInitialDatasetListActions.success, getDatasetPageActions.success), (_, action) =>
    action.payload.items.map(item => item.id),
  );
});

const pagination = createReducer<Pagination>(emptyPagination, builder => {
  builder.addCase(setActiveGroupIdAction, () => emptyPagination);
  builder.addCase(getDatasetPageActions.request, (state, action) => ({ ...state, ...action.payload }));
  builder.addMatcher(
    isAnyOf(getGroupsInitialDatasetListActions.success, getDatasetPageActions.success),
    (state, action) => ({
      ...state,
      total: action.payload.total,
      pages: action.payload.pages,
    }),
  );
});

export const datasetsReducer = combineReducers({
  datasetsById,
  datasetsOrder,
  pagination,
  areDatasetsLoading,
  isDatasetCreating,
});
