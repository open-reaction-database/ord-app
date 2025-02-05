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
import { createThunk, createThunkWithExplicitResult } from 'common/store';
import {
  createEmptyReactionActions,
  getReactionActions,
  getReactionPageActions,
  getReactionsListActions,
  importReactionFromFileActions,
  renameReactionActions,
  updateReactionActions,
} from './reactions.actions';
import axiosInstance from 'common/config/axiosConfig';
import type { Pages } from 'common/types';
import type { Reaction, ReactionResponse, ReactionWrapper } from './reactions.types';
import ordSchema from 'ord-schema';
import { selectActiveDatasetId, selectReactionById, selectReactionsPagination } from './reactions.selectors';
import { navigate } from 'wouter/use-browser-location';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents';
import { deepmerge as deepmergeFactory, type Options } from '@fastify/deepmerge';

const parseReaction = ({ binpb, ...rest }: ReactionResponse): ReactionWrapper => ({
  ...rest,
  // TODO check whether we need to cast it
  data: ordSchema.Reaction.deserializeBinary(binpb as unknown as Uint8Array).toObject(),
});

const parseReactionList = (pages: Pages<ReactionResponse>): Pages<ReactionWrapper> => {
  const { items, ...pagination } = pages;
  const wrappedItems = items.map(parseReaction);
  return { ...pagination, items: wrappedItems };
};

export const getReactionsList = createThunk(getReactionsListActions, async (_d, getState, datasetId) => {
  const currentPage = selectReactionsPagination(getState());
  const params = { page: currentPage.page, size: currentPage.size };
  const result = await axiosInstance.get<Pages<ReactionResponse>>(`/datasets/${datasetId}/reactions`, { params });
  return getReactionsListActions.success(parseReactionList(result.data));
});

export const getReactionsPage = createThunk(getReactionPageActions, async (_d, getState) => {
  const state = getState();
  const currentPage = selectReactionsPagination(state);
  const datasetId = selectActiveDatasetId(state);
  const params = { page: currentPage.page, size: currentPage.size };

  const result = await axiosInstance.get<Pages<ReactionResponse>>(`/datasets/${datasetId}/reactions`, { params });
  return getReactionPageActions.success(parseReactionList(result.data));
});

export const getReaction = createThunk(getReactionActions, async (_d, getState, { reactionId }) => {
  const datasetId = selectActiveDatasetId(getState());

  const result = await axiosInstance.get<ReactionResponse>(`/datasets/${datasetId}/reactions/${reactionId}`);
  return getReactionActions.success(parseReaction(result.data));
});

export const renameReaction = createThunk(renameReactionActions, async (_d, getState, { reactionId, name }) => {
  const datasetId = selectActiveDatasetId(getState());
  const result = await axiosInstance.patch<ReactionResponse>(`/datasets/${datasetId}/reactions/${reactionId}`, {
    name,
  });
  return renameReactionActions.success(parseReaction(result.data));
});

export const createEmptyReaction = createThunkWithExplicitResult(
  createEmptyReactionActions,
  async (dispatch, getState) => {
    const datasetId = selectActiveDatasetId(getState());

    const result = await axiosInstance.post<ReactionResponse>(`/datasets/${datasetId}/reactions`, {});
    const reaction = parseReaction(result.data);
    dispatch(createEmptyReactionActions.success(reaction));
    navigate(`/dataset/${datasetId}/reaction/${reaction.id}`);
  },
);

export const importReactionFromFile = createThunkWithExplicitResult(
  importReactionFromFileActions,
  async (dispatch, getState, { file }) => {
    const datasetId = selectActiveDatasetId(getState());

    const formData = new FormData();
    formData.append('file', file);

    const result = await axiosInstance.post<ReactionResponse>(`/datasets/${datasetId}/reactions/upload`, formData);
    const reaction = parseReaction(result.data);
    dispatch(importReactionFromFileActions.success(reaction));
    navigate(`/dataset/${datasetId}/reaction/${reaction.id}`);
  },
);

function mergeArray({ isMergeableObject, deepmerge, clone }: Parameters<Required<Options>['mergeArray']>[0]) {
  return function (target: Array<unknown>, source: Array<unknown>) {
    const targetClone = clone(target);
    source.forEach((item, index) => {
      if (item) {
        const isMergeable = isMergeableObject(targetClone[index]) && isMergeableObject(item);
        targetClone[index] = isMergeable ? deepmerge(targetClone[index], item) : item;
      }
    });
    return targetClone;
  };
}

const deepmerge = deepmergeFactory({ mergeArray });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateDeepPartialReactionByPath(pathComponents: ReactionPathComponents, value: any): any {
  if (pathComponents.length === 0) {
    return value;
  }
  const [currentPathComponent, ...rest] = pathComponents;
  if (typeof currentPathComponent === 'number') {
    const array = [];
    array[currentPathComponent] = generateDeepPartialReactionByPath(rest, value);
    return array;
  }
  const object: Record<string, unknown> = {};
  object[currentPathComponent] = generateDeepPartialReactionByPath(rest, value);
  return object;
}

export const updateReaction = createThunk(
  updateReactionActions,
  async (_d, getState, { reactionId, pathComponents, newValue }) => {
    const { data, ...reaction } = selectReactionById(reactionId)(getState());
    const updatedReaction: Reaction = deepmerge(
      data,
      generateDeepPartialReactionByPath(pathComponents, newValue) as unknown as Reaction,
    );
    const resultReaction: ReactionWrapper = { ...reaction, data: updatedReaction };
    return updateReactionActions.success(resultReaction);
  },
);
