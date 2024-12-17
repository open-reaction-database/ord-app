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
import { getDatasetActions } from './datasets.actions.ts';
import type { Dataset } from './datasets.types.ts';
import { createThunk } from '../../common/store';
import axiosInstance from 'common/config/axiosConfig.ts';

export const getDataset = createThunk(getDatasetActions, async (dispatch, getState, datasetId) => {
  console.info(dispatch, getState, datasetId);
  const dataset = (await axiosInstance.get<Dataset>(`/datasets/${datasetId}`)).data;
  return getDatasetActions.success(dataset);
});
