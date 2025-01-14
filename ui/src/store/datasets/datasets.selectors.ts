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

const selectRootState = (state: AppState) => state.datasets;

const selectDatasets = (state: AppState) => selectRootState(state).datasetsById;

const selectDatasetsOrder = (state: AppState) => selectRootState(state).datasetsOrder;

export const selectAreDatasetsLoading = (state: AppState) => selectRootState(state).areDatasetsLoading;

export const selectDatasetById = (id: number) => (state: AppState) => selectRootState(state).datasetsById[id];

export const selectDatasetsPagination = (state: AppState) => selectRootState(state).pagination;

export const selectOrderedDatasets = createSelector([selectDatasetsOrder, selectDatasets], (order, datasetsById) =>
  order.map(id => datasetsById[id]),
);

export const selectIsDatasetCreating = (state: AppState) => selectRootState(state).isDatasetCreating;

export const selectIsDatasetOpened = (state: AppState) => selectRootState(state).isDatasetEditOpened;
