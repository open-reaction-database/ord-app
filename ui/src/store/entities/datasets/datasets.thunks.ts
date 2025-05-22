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
  getDatasetGroupsActions,
  getDatasetPageActions,
  getGroupsInitialDatasetListActions,
  removeDatasetActions,
  shareDatasetWithGroupActions,
  unshareDatasetWithGroupActions,
  updateDatasetActions,
} from './datasets.actions.ts';
import type { Dataset, DatasetGroup } from './datasets.types.ts';
import { createThunk, createThunkWithExplicitResult } from 'store/utils';
import axiosInstance from 'store/axiosInstance.ts';
import type { Pages } from 'common/types';
import { selectDatasetsPagination } from './datasets.selectors.ts';
import { navigate } from 'wouter/use-browser-location';
import { selectActiveGroupId } from '../../features/groups/groups.selectors.ts';
import { handleApiError } from 'store/utils/handleApiError.ts';

export const getDataset = createThunk(getDatasetActions, datasetId => async () => {
  try {
    const response = await axiosInstance.get<Dataset>(`/datasets/${datasetId}`);
    return getDatasetActions.success(response.data);
  } catch (error) {
    return getDatasetActions.failure(handleApiError(error));
  }
});

export const getInitialDatasetsList = createThunk(getGroupsInitialDatasetListActions, groupId => async () => {
  const url = groupId ? `/groups/${groupId}/datasets` : 'datasets';
  const params = { page: 1, size: 10 };

  const datasetsPages = (await axiosInstance.get<Pages<Dataset>>(url, { params })).data;
  return getGroupsInitialDatasetListActions.success(datasetsPages);
});

export const getDatasetsPage = createThunk(getDatasetPageActions, () => async (_d, getState) => {
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
  ({ groupId, ...payload }) =>
    async dispatch => {
      const dataset = (await axiosInstance.post<Dataset>(`/groups/${groupId}/datasets`, payload)).data;
      dispatch(createNewDatasetActions.success(dataset));
      navigate(`/datasets/${dataset.id}`);
    },
);

export async function createDatasetFromFileOperation(groupId: number, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return await axiosInstance.post<Dataset>(`/groups/${groupId}/datasets/upload`, formData);
}

export const createDatasetFromFile = createThunkWithExplicitResult(
  createDatasetFromFileActions,
  ({ groupId, file }) =>
    async dispatch => {
      const dataset = (await createDatasetFromFileOperation(groupId, file)).data;
      dispatch(createDatasetFromFileActions.success(dataset));
      navigate(`/datasets/${dataset.id}`);
    },
);

export const updateDataset = createThunk(updateDatasetActions, ({ id, ...payload }) => async () => {
  const updatedDataset = (await axiosInstance.patch<Dataset>(`datasets/${id}`, payload)).data;
  return updateDatasetActions.success(updatedDataset);
});

export const removeDataset = createThunkWithExplicitResult(removeDatasetActions, datasetId => async dispatch => {
  await axiosInstance.delete(`/datasets/${datasetId}`);
  dispatch(removeDatasetActions.success());
  navigate(`/`);
});

export const getDatasetGroups = createThunk(getDatasetGroupsActions, datasetId => async () => {
  const response = await axiosInstance.get<Array<DatasetGroup>>(`/datasets/${datasetId}/groups`);
  return getDatasetGroupsActions.success(response.data);
});

export const shareDatasetWithGroup = createThunkWithExplicitResult(
  shareDatasetWithGroupActions,
  ({ groupId, datasetId, primaryGroupId }) =>
    async dispatch => {
      await axiosInstance.post(`/groups/${primaryGroupId}/datasets/${datasetId}/share`, {
        secondary_group_id: groupId,
      });
      dispatch(shareDatasetWithGroupActions.success());
      dispatch(getDataset(datasetId));
      dispatch(getDatasetGroups(datasetId));
    },
);

export const unshareDatasetWithGroup = createThunkWithExplicitResult(
  unshareDatasetWithGroupActions,
  ({ groupId, datasetId, primaryGroupId }) =>
    async dispatch => {
      await axiosInstance.post(`/groups/${primaryGroupId}/datasets/${datasetId}/unshare`, {
        secondary_group_id: groupId,
      });
      dispatch(unshareDatasetWithGroupActions.success(groupId));
      dispatch(getDataset(datasetId));
    },
);
