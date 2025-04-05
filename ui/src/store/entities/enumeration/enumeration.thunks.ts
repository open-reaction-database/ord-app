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
import { enumerateBatchActions, finishEnumerationAction, startEnumerationActions } from './enumeration.actions.ts';
import type { ThunkCustomWrapper } from 'common/types/store/thunk.ts';
import type { ActionPayload } from 'common/types';
import { selectEnumerationProgress } from './enumeration.selectors.ts';
import type { EnumerationProgress, SetupEnumeration } from './enumeration.types.ts';
import { selectReactionById } from '../reactions/reactions.selectors.ts';
import type { CreateDatasetBase, Dataset } from '../datasets/datasets.types.ts';
import axiosInstance from '../../axiosInstance.ts';
import { getDataset } from '../datasets/datasets.thunks.ts';
import { getReactionsPage } from '../reactions/reactions.thunks.ts';

const BATCH_SIZE = 50;

export const startEnumeration: ThunkCustomWrapper<SetupEnumeration> =
  ({ templateId, ...rest }) =>
  (dispatch, getState) => {
    const template = selectReactionById(templateId)(getState());
    const variablesList = Object.values(template.variables);

    dispatch(startEnumerationActions({ ...rest, data: template.data, variables: variablesList }));
    dispatch(enumerateBatchResult({ reactions: [], errors: [] }));
  };

export const enumerateBatchResult: ThunkCustomWrapper<ActionPayload<typeof enumerateBatchActions.success>> =
  param => (dispatch, getState) => {
    dispatch(enumerateBatchActions.success(param));
    const state = getState();
    const enumerationProgress = selectEnumerationProgress(state);
    if (!enumerationProgress) {
      return;
    }

    const { index, templateCSV, data, variables, matching } = enumerationProgress;
    const hasEnumerationFinished = index >= templateCSV.content.length;

    if (hasEnumerationFinished) {
      dispatch(finishEnumeration());
      return;
    }

    const templateCSVBatch = {
      headers: templateCSV.headers,
      content: templateCSV.content.slice(index, index + BATCH_SIZE),
    };

    dispatch(
      enumerateBatchActions.request({
        index: index,
        templateCSV: templateCSVBatch,
        matching,
        data,
        variables,
      }),
    );
  };

const fakeDataset: CreateDatasetBase = { name: '', description: '' };

function prepareDataset(enumerationProgress: EnumerationProgress): CreateDatasetBase & { reactions: Array<string> } {
  const { dataset, reactions } = enumerationProgress;
  const isNewDataset = typeof dataset === 'object';
  const datasetForFile = isNewDataset
    ? {
        name: dataset.name,
        description: dataset.description,
      }
    : fakeDataset;

  return {
    ...datasetForFile,
    reactions,
  };
}

export const finishEnumeration: ThunkCustomWrapper<void> = () => async (dispatch, getState) => {
  const enumerationProgress = selectEnumerationProgress(getState());
  if (!enumerationProgress) {
    return;
  }
  const { dataset, reactions } = enumerationProgress;

  if (reactions.length === 0) {
    dispatch(finishEnumerationAction(null));
    return;
  }

  const datasetEnumeration = prepareDataset(enumerationProgress);
  const isNewDataset = typeof dataset === 'object';

  if (isNewDataset) {
    const createdDataset = await axiosInstance.post<Dataset>(
      `/groups/${dataset.groupId}/datasets/enumerate`,
      datasetEnumeration,
    );
    dispatch(finishEnumerationAction(createdDataset.data.id));
  } else {
    const datasetId = dataset;
    await axiosInstance.post<Dataset>(`/datasets/${datasetId}/enumerate/extend`, datasetEnumeration);
    dispatch(finishEnumerationAction(datasetId));
    dispatch(getDataset(datasetId));
    dispatch(getReactionsPage({ page: 1 }));
  }
};
