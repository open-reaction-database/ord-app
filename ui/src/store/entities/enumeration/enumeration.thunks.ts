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
import { enumerateBatchActions, startEnumerationActions } from './enumeration.actions.ts';
import type { ThunkCustomWrapper } from 'common/types/store/thunk.ts';
import type { ActionPayload } from 'common/types';
import { selectEnumerationProgress } from './enumeration.selectors.ts';
import type { EnumerationProgress, SetupEnumeration } from './enumeration.types.ts';
import { selectReactionById } from '../reactions/reactions.selectors.ts';
import { createDatasetFromFile } from '../datasets/datasets.thunks.ts';
import { ord } from 'ord-schema-protobufjs';
import { Buffer } from 'buffer';
import type { CreateDatasetBase } from '../datasets/datasets.types.ts';

const BATCH_SIZE = 50;

export const startEnumeration: ThunkCustomWrapper<SetupEnumeration> =
  ({ templateId, ...rest }) =>
  (dispatch, getState) => {
    const template = selectReactionById(templateId)(getState());

    dispatch(startEnumerationActions({ ...rest, data: template.data, variables: template.variables }));
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
        templateCSV: templateCSVBatch,
        matching,
        data,
        variables,
      }),
    );
  };

const fakeDataset: CreateDatasetBase = { name: '', description: '' };

export const finishEnumeration: ThunkCustomWrapper<void> = () => (dispatch, getState) => {
  const { dataset, reactions } = selectEnumerationProgress(getState()) as EnumerationProgress;
  console.info(dataset);
  const jsonReactions = reactions.map(binpb => ord.Reaction.decode(Buffer.from(binpb, 'base64')));
  const isNewDataset = typeof dataset === 'object';
  const datasetForFile = isNewDataset
    ? {
        name: dataset.name,
        description: dataset.description,
      }
    : fakeDataset;

  const datasetWithReactions = JSON.stringify({
    ...datasetForFile,
    reactions: jsonReactions,
  });

  const file = new File([datasetWithReactions], 'dataset.json');

  if (typeof dataset !== 'object') {
    return;
  }

  dispatch(createDatasetFromFile({ groupId: dataset.groupId, file }));
};
