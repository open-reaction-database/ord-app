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
import { createThunk, createThunkWithExplicitResult } from 'store/utils';
import {
  createEmptyReactionActions,
  getReactionActions,
  getReactionPageActions,
  getReactionsListActions,
  importReactionFromFileActions,
  renameReactionActions,
  addUpdateReactionFieldActions,
  deleteReactionFieldActions,
} from './reactions.actions.ts';
import axiosInstance from 'store/axiosInstance.ts';
import type { Pages } from 'common/types';
import type { ReactionResponse, ReactionWrapper } from './reactions.types.ts';
import { selectActiveDatasetId, selectReactionById, selectReactionsPagination } from './reactions.selectors.ts';
import { navigate } from 'wouter/use-browser-location';
import { selectDatasetById } from '../datasets/datasets.selectors.ts';
import { getDataset } from '../datasets/datasets.thunks.ts';
import { type Action, type ThunkDispatch } from '@reduxjs/toolkit';
import type { AppState } from '../../configureAppStore.ts';
import { ord } from 'ord-schema-protobufjs';
import { Buffer } from 'buffer';
import { ordReactionToReaction, reactionToOrdReaction } from './reactions.converters.ts';
import { showNotification } from 'common/utils/showNotification.tsx';

const parseReaction = ({ binpb, ...rest }: ReactionResponse): ReactionWrapper => {
  const parsedProtobuf = ord.Reaction.decode(Buffer.from(binpb, 'base64'));
  const appReaction = ordReactionToReaction(ord.Reaction.toObject(parsedProtobuf));

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
    navigate(`/datasets/${datasetId}/reactions/${reaction.id}`);
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
    navigate(`/datasets/${datasetId}/reactions/${reaction.id}`);
  },
);

async function updateReaction(reactionId: number, getState: () => AppState): Promise<ReactionResponse> {
  const datasetId = selectActiveDatasetId(getState());
  const reaction = selectReactionById(reactionId)(getState());
  const ordReaction = reactionToOrdReaction(reaction.data);
  const payload = Buffer.from(ord.Reaction.encode(ordReaction).finish()).toString('base64');
  return (
    await axiosInstance.patch(`datasets/${datasetId}/reactions/${reactionId}`, {
      binpb: payload,
    })
  ).data;
}

export const addUpdateReactionField = createThunkWithExplicitResult(
  addUpdateReactionFieldActions,
  async (dispatch, getState, { reactionId }) => {
    const { binpb: _, ...reaction } = await updateReaction(reactionId, getState);
    dispatch(addUpdateReactionFieldActions.success(reaction));
    showNotification({ message: 'Reaction updated.', variant: 'success' });
  },
);

export const deleteReactionField = createThunk(deleteReactionFieldActions, async (_d, getState, { reactionId }) => {
  await updateReaction(reactionId, getState);
  return deleteReactionFieldActions.success();
});
