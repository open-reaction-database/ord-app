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
import type { Dataset, DatasetGroup } from './datasets.types.ts';
import {
  clearDatasetGroupsListAction,
  createDatasetFromFileActions,
  createNewDatasetActions,
  getDatasetActions,
  getDatasetGroupsActions,
  getDatasetPageActions,
  getGroupsInitialDatasetListActions,
  setDatasetEditOpenedAction,
  shareDatasetWithGroupActions,
  unshareDatasetWithGroupActions,
  updateDatasetActions,
} from './datasets.actions.ts';
import { emptyPagination } from 'common/constants.ts';
import { setActiveGroupIdAction } from '../groups/groups.actions.ts';

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
  builder.addMatcher(isAnyOf(createNewDatasetActions.request, createDatasetFromFileActions.request), () => true);
  builder.addMatcher(
    isAnyOf(
      createNewDatasetActions.success,
      createNewDatasetActions.failure,
      createDatasetFromFileActions.success,
      createDatasetFromFileActions.failure,
    ),
    () => false,
  );
});

const datasetsById = createReducer<ItemsById<Dataset>>({}, builder => {
  builder.addCase(getDatasetActions.success, (state, action) => ({
    ...state,
    [getDatasetId(action.payload)]: action.payload,
  }));
  builder.addCase(updateDatasetActions.success, (state, action) => ({
    ...state,
    [action.payload.id]: {
      ...state[action.payload.id],
      ...action.payload,
    },
  }));
  builder.addMatcher(
    isAnyOf(createNewDatasetActions.success, createDatasetFromFileActions.success),
    (state, action) => ({
      ...state,
      [getDatasetId(action.payload)]: action.payload,
    }),
  );
  builder.addMatcher(
    isAnyOf(getGroupsInitialDatasetListActions.success, getDatasetPageActions.success),
    (state, action) => ({
      ...state,
      ...action.payload.items.reduce(
        (acc: Record<string, Dataset>, item) => ({
          ...acc,
          [getDatasetId(item)]: {
            ...(state[item.id] || {}),
            ...item,
          },
        }),
        {},
      ),
    }),
  );
});

const datasetsOrder = createReducer<Array<number>>([], builder => {
  builder.addCase(setActiveGroupIdAction, () => []);
  builder.addMatcher(isAnyOf(getGroupsInitialDatasetListActions.request, getDatasetPageActions.request), () => []);
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

const isDatasetEditOpened = createReducer<boolean>(false, builder => {
  builder.addCase(setDatasetEditOpenedAction, (_, action) => action.payload);
  builder.addCase(updateDatasetActions.success, () => false);
});

const datasetGroups = createReducer<Array<DatasetGroup> | null>(null, builder => {
  builder.addCase(clearDatasetGroupsListAction, () => null);
  builder.addCase(getDatasetGroupsActions.success, (_, action) => action.payload);
  builder.addCase(unshareDatasetWithGroupActions.success, (state, action) =>
    state ? state.filter(item => item.id !== action.payload) : null,
  );
});

const areDatasetGroupsLoading = createReducer<boolean>(false, builder => {
  builder.addMatcher(
    isAnyOf(
      getDatasetGroupsActions.request,
      shareDatasetWithGroupActions.request,
      unshareDatasetWithGroupActions.request,
    ),
    () => true,
  );
  builder.addMatcher(
    isAnyOf(
      getDatasetGroupsActions.success,
      getDatasetGroupsActions.failure,
      clearDatasetGroupsListAction,
      shareDatasetWithGroupActions.failure,
      unshareDatasetWithGroupActions.success,
      unshareDatasetWithGroupActions.failure,
    ),
    () => false,
  );
});

export const datasetsReducer = combineReducers({
  datasetsById,
  datasetsOrder,
  pagination,
  areDatasetsLoading,
  isDatasetCreating,
  isDatasetEditOpened,
  datasetGroups,
  areDatasetGroupsLoading,
});
