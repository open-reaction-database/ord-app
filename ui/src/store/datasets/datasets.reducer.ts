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
import type { ItemsById } from 'common/types';
import type { Dataset } from './datasets.types.ts';
import { getDatasetActions, getDatasetListActions } from './datasets.actions.ts';
import { itemsById } from 'common/utils';

const getDatasetId = (dataset: Dataset) => dataset.id;

const datasetsById = createReducer<ItemsById<Dataset>>({}, builder => {
  builder.addCase(getDatasetActions.success, (state, action) => ({
    ...state,
    [getDatasetId(action.payload)]: action.payload,
  }));
  builder.addCase(getDatasetListActions.success, (_, action) => itemsById(action.payload, getDatasetId));
});

export const datasetsReducer = combineReducers({
  datasetsById,
});
