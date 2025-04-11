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
  addUpdateReactionFieldActions,
  createEmptyReactionActions,
  deleteReactionFieldActions,
  getReactionActions,
  getReactionPageActions,
  getReactionsListActions,
  importReactionFromFileActions,
  removeReactionActions,
  renameReactionActions,
  searchReactionActions,
} from './reactions.actions.ts';
import axiosInstance from 'store/axiosInstance.ts';
import type { Pages } from 'common/types';
import type { AppReaction, ReactionId, ReactionResponse, UpdateReactionSuccessPayload } from './reactions.types.ts';
import { selectActiveDatasetId, selectReactionById, selectReactionsPagination } from './reactions.selectors.ts';
import { navigate } from 'wouter/use-browser-location';
import type { AppState } from '../../configureAppStore.ts';
import { ord } from 'ord-schema-protobufjs';
import { Buffer } from 'buffer';
import { reactionToOrdReaction } from './reactions.converters.ts';
import { showNotification } from 'common/utils/showNotification.tsx';
import { handleApiError } from 'store/utils/handleApiError.ts';
import type { Action, ThunkDispatch } from '@reduxjs/toolkit';
import { getDataset } from '../datasets/datasets.thunks.ts';
import { selectDatasetById } from '../datasets/datasets.selectors.ts';
import { NotificationVariant } from 'common/types/notification.ts';
import { getReactionPreviews, parseReaction, parseReactionList, parseValidation } from './reactions.utils.ts';

export const getReactionsList = createThunk(getReactionsListActions, async (_d, getState, datasetId) => {
  try {
    const currentPage = selectReactionsPagination(getState());
    const params = { page: currentPage.page, size: currentPage.size };

    const response = await axiosInstance.get<Pages<ReactionResponse>>(`/datasets/${datasetId}/reactions`, { params });

    return getReactionsListActions.success(parseReactionList(response.data));
  } catch (error) {
    return getReactionsListActions.failure(handleApiError(error));
  }
});

export const getReactionsPage = createThunk(getReactionPageActions, async (_d, getState) => {
  const state = getState();
  const currentPage = selectReactionsPagination(state);
  const datasetId = selectActiveDatasetId(state);
  const params = { page: currentPage.page, size: currentPage.size };

  const result = await axiosInstance.get<Pages<ReactionResponse>>(`/datasets/${datasetId}/reactions`, { params });
  return getReactionPageActions.success(parseReactionList(result.data));
});

// TODO only update metadata when reaction is already in the store
export const getReaction = createThunk(getReactionActions, async (dispatch, getState, { reactionId }) => {
  try {
    const state = getState();
    const datasetId = selectActiveDatasetId(state);
    const dataset = selectDatasetById(datasetId)(getState());

    if (!dataset) {
      (dispatch as ThunkDispatch<AppState, never, Action>)(getDataset(datasetId));
    }

    const response = await axiosInstance.get<ReactionResponse>(`/datasets/${datasetId}/reactions/${reactionId}`);
    const parsedReaction = parseReaction(response.data);
    return getReactionActions.success(parsedReaction);
  } catch (error) {
    return getReactionActions.failure(handleApiError(error));
  }
});

export const createEmptyReaction = createThunkWithExplicitResult(
  createEmptyReactionActions,
  async (dispatch, getState) => {
    const datasetId = selectActiveDatasetId(getState());
    const result = await axiosInstance.post<ReactionResponse>(`/datasets/${datasetId}/reactions/from-scratch`);
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

async function updateReaction(reactionId: ReactionId, getState: () => AppState): Promise<UpdateReactionSuccessPayload> {
  const datasetId = selectActiveDatasetId(getState());
  const reaction = selectReactionById(reactionId)(getState());
  const ordReaction = reactionToOrdReaction(reaction.data);
  const payload = Buffer.from(ord.Reaction.encode(ordReaction).finish()).toString('base64');
  const {
    binpb: _,
    molblocks,
    validation,
    ...reactionMetadata
  } = (
    await axiosInstance.patch<ReactionResponse>(`datasets/${datasetId}/reactions/${reactionId}`, {
      binpb: payload,
    })
  ).data;
  const updatedValidation = validation ? parseValidation(validation) : null;
  return {
    ...reactionMetadata,
    previews: getReactionPreviews(reaction.data, molblocks),
    validation: updatedValidation,
  };
}

export const renameReaction = createThunk(renameReactionActions, async (_d, getState, { reactionId, name }) => {
  const datasetId = selectActiveDatasetId(getState());
  const reaction = selectReactionById(reactionId)(getState());
  const updatedReaction: AppReaction = { ...reaction.data, reactionId: name };
  const ordReaction = reactionToOrdReaction(updatedReaction);
  const payload = Buffer.from(ord.Reaction.encode(ordReaction).finish()).toString('base64');
  await axiosInstance.patch<ReactionResponse>(`datasets/${datasetId}/reactions/${reactionId}`, {
    binpb: payload,
  });
  return renameReactionActions.success({ reactionId, name });
});

export const addUpdateReactionField = createThunkWithExplicitResult(
  addUpdateReactionFieldActions,
  async (dispatch, getState, { reactionId }) => {
    try {
      const result = await updateReaction(reactionId, getState);
      dispatch(addUpdateReactionFieldActions.success(result));
      showNotification({ message: 'Reaction updated.', variant: NotificationVariant.SUCCESS });
    } catch (e) {
      showNotification({ message: 'Failed to update reaction.', variant: NotificationVariant.ERROR });
      throw e;
    }
  },
);

export const deleteReactionField = createThunkWithExplicitResult(
  deleteReactionFieldActions,
  async (dispatch, getState, { reactionId }) => {
    const result = await updateReaction(reactionId, getState);
    dispatch(deleteReactionFieldActions.success(result));
    showNotification({ message: 'Reaction updated.', variant: NotificationVariant.SUCCESS });
  },
);

export const removeReaction = createThunkWithExplicitResult(
  removeReactionActions,
  async (dispatch, getState, reactionId) => {
    const datasetId = selectActiveDatasetId(getState());
    await axiosInstance.delete(`/datasets/${datasetId}/reactions/${reactionId}`);
    dispatch(removeReactionActions.success(reactionId));
    navigate(`/datasets/${datasetId}`);
  },
);

export const searchReaction = createThunkWithExplicitResult(
  searchReactionActions,
  async (dispatch, getState, reactionPbId) => {
    const datasetId = selectActiveDatasetId(getState());
    try {
      const result = (
        await axiosInstance.get<ReactionResponse>(`/datasets/${datasetId}/reactions/search`, {
          params: { pb_reaction_id: reactionPbId },
        })
      ).data;
      const parsedReaction = parseReaction(result);
      dispatch(searchReactionActions.success(parsedReaction));
      navigate(`/datasets/${datasetId}/reactions/${parsedReaction.id}`);
    } catch (_e: unknown) {
      dispatch(searchReactionActions.failure(null));
      showNotification({
        message: 'Reaction with this ID do not exist in this dataset',
        variant: NotificationVariant.ERROR,
      });
    }
  },
);
