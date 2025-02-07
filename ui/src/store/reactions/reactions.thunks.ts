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
  addUpdateReactionFieldActions,
  deleteReactionFieldActions,
} from './reactions.actions';
import axiosInstance from 'common/config/axiosConfig';
import type { Pages } from 'common/types';
import type { ReactionResponse, ReactionWrapper } from './reactions.types';
import { selectActiveDatasetId, selectReactionById, selectReactionsPagination } from './reactions.selectors';
import { navigate } from 'wouter/use-browser-location';
import { selectDatasetById } from '../datasets/datasets.selectors';
import { getDataset } from '../datasets/datasets.thunks';
import { type Action, type ThunkDispatch } from '@reduxjs/toolkit';
import type { AppState } from '../configureAppStore';
import { ord } from 'ord-schema-protobufjs';
import { Buffer } from 'buffer';
import { appInputsToOrdInputs, ordInputsToAppInputs } from '../../common/utils/reactionForm/reactionInputsConverter';

const parseReaction = ({ binpb, ...rest }: ReactionResponse): ReactionWrapper => {
  const parsedProtobuf = ord.Reaction.decode(Buffer.from(binpb, 'base64'));
  const { inputs, ...persistentReactionData }: ord.IReaction = ord.Reaction.toObject(parsedProtobuf);
  const appReaction = {
    ...persistentReactionData,
    inputs: ordInputsToAppInputs(inputs),
  };

  return {
    ...rest,
    data: appReaction,
  };
};

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

export const getReaction = createThunk(getReactionActions, async (dispatch, getState, { reactionId }) => {
  const datasetId = selectActiveDatasetId(getState());
  const dataset = selectDatasetById(datasetId)(getState());

  if (!dataset) {
    (dispatch as ThunkDispatch<AppState, never, Action>)(getDataset(datasetId));
  }

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

async function updateReaction(reactionId: number, getState: () => AppState): Promise<void> {
  const datasetId = selectActiveDatasetId(getState());
  const reaction = selectReactionById(reactionId)(getState());
  const { inputs, ...persistentData } = reaction.data;
  const ordReaction = {
    ...persistentData,
    inputs: appInputsToOrdInputs(inputs),
  };
  const payload = Buffer.from(ord.Reaction.encode(ordReaction).finish()).toString('base64');
  await axiosInstance.patch(`datasets/${datasetId}/reactions/${reactionId}`, {
    binpb: payload,
  });
  return;
}

export const addUpdateReactionField = createThunk(
  addUpdateReactionFieldActions,
  async (_d, getState, { reactionId }) => {
    await updateReaction(reactionId, getState);
    return addUpdateReactionFieldActions.success();
  },
);

export const deleteReactionField = createThunk(deleteReactionFieldActions, async (_d, getState, { reactionId }) => {
  await updateReaction(reactionId, getState);
  return deleteReactionFieldActions.success();
});
