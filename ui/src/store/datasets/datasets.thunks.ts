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
import {
  createDatasetFromFileActions,
  createNewDatasetActions,
  getDatasetActions,
  getDatasetPageActions,
  getGroupsInitialDatasetListActions,
} from './datasets.actions';
import type { Dataset } from './datasets.types';
import { createThunk, createThunkWithExplicitResult } from '../../common/store';
import axiosInstance from 'common/config/axiosConfig';
import type { Pages } from '../../common/types';
import { selectActiveGroupId } from '../groups/groups.selectors';
import { selectDatasetsPagination } from './datasets.selectors';
import { navigate } from 'wouter/use-browser-location';

export const getDataset = createThunk(getDatasetActions, async (_d, _g, datasetId) => {
  const dataset = (await axiosInstance.get<Dataset>(`/datasets/${datasetId}`)).data;
  return getDatasetActions.success(dataset);
});

export const getInitialDatasetsList = createThunk(getGroupsInitialDatasetListActions, async (_d, _g, groupId) => {
  const url = groupId ? `/groups/${groupId}/datasets` : 'datasets';
  const params = { page: 1, size: 10 };

  const datasetsPages = (await axiosInstance.get<Pages<Dataset>>(url, { params })).data;
  return getGroupsInitialDatasetListActions.success(datasetsPages);
});

export const getDatasetsPage = createThunk(getDatasetPageActions, async (_d, getState) => {
  const state = getState();
  const activeGroupId = selectActiveGroupId(state);
  const currentPage = selectDatasetsPagination(state);

  const url = activeGroupId ? `/groups/${activeGroupId}/datasets` : '/datasets';
  const params = { page: currentPage.page, size: currentPage.size };

  const datasetsPages = (await axiosInstance.get<Pages<Dataset>>(url, { params })).data;
  return getDatasetPageActions.success(datasetsPages);
});

export const createEmptyDataset = createThunkWithExplicitResult(
  createNewDatasetActions,
  async (dispatch, _g, { groupId, ...payload }) => {
    const dataset = (await axiosInstance.post<Dataset>(`/group/${groupId}/datasets`, payload)).data;
    dispatch(createNewDatasetActions.success(dataset));
    navigate(`/dataset/${dataset.id}`);
  },
);

export const createDatasetFromFile = createThunkWithExplicitResult(
  createDatasetFromFileActions,
  async (dispatch, _g, { groupId, file }) => {
    const formData = new FormData();
    formData.append('file', file);

    const dataset = (await axiosInstance.post<Dataset>(`/groups/${groupId}/datasets/upload`, formData)).data;
    dispatch(createDatasetFromFileActions.success(dataset));
    navigate(`/dataset/${dataset.id}`);
  },
);
