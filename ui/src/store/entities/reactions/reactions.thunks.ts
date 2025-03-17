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
  removeReactionActions,
} from './reactions.actions.ts';
import axiosInstance from 'store/axiosInstance.ts';
import type { Pages } from 'common/types';
import type { AppReaction, ReactionMolBlocks, ReactionResponse, ReactionWrapper } from './reactions.types.ts';
import { selectActiveDatasetId, selectReactionById, selectReactionsPagination } from './reactions.selectors.ts';
import { navigate } from 'wouter/use-browser-location';
import type { AppState } from '../../configureAppStore.ts';
import { ord } from 'ord-schema-protobufjs';
import { Buffer } from 'buffer';
import { ordReactionToReaction, reactionToOrdReaction } from './reactions.converters.ts';
import { showNotification } from 'common/utils/showNotification.tsx';
import type { AppReactionInput } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import type { PreviewsById } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.types.ts';
import { handleApiError, type RejectValue } from 'store/utils/handleApiError.ts';
import type { Action, ThunkDispatch } from '@reduxjs/toolkit';
import { getDataset } from '../datasets/datasets.thunks.ts';
import { selectDatasetById } from '../datasets/datasets.selectors.ts';

export const getReactionPreviews = (reaction: AppReaction, molblocks: ReactionMolBlocks): PreviewsById => {
  const inputsArray = Object.values(reaction.inputs);
  const inputsPreviews: PreviewsById = Object.entries(molblocks.inputs).reduce(
    (acc: PreviewsById, [inputName, input]) => ({
      ...acc,
      ...input.reduce((acc: PreviewsById, item, index) => {
        const component = (inputsArray.find(item => item.name === inputName) as AppReactionInput).components[index];
        return {
          ...acc,
          [component.id]: item,
        };
      }, {}),
    }),
    {},
  );

  const outcomesPreviews: PreviewsById = molblocks.outcomes.reduce(
    (acc: PreviewsById, products, outcomeIndex) => ({
      ...acc,
      ...products.reduce((acc: PreviewsById, item, productIndex) => {
        const product = reaction.outcomes[outcomeIndex].products[productIndex];
        return {
          ...acc,
          [product.id]: item,
        };
      }, {}),
    }),
    {},
  );
  return { ...inputsPreviews, ...outcomesPreviews };
};

const parseReaction = ({ binpb, molblocks, ...rest }: ReactionResponse): ReactionWrapper => {
  const parsedProtobuf = ord.Reaction.decode(Buffer.from(binpb, 'base64'));
  const appReaction = ordReactionToReaction(ord.Reaction.toObject(parsedProtobuf));
  const previews = getReactionPreviews(appReaction, molblocks);

  return {
    ...rest,
    previews,
    data: appReaction,
  };
};

const parseReactionList = (pages: Pages<ReactionResponse>): Pages<ReactionWrapper> => {
  const { items, ...pagination } = pages;
  const wrappedItems = items.map(parseReaction);
  return { ...pagination, items: wrappedItems };
};

export const getReactionsList = createThunk(getReactionsListActions, async (_d, getState, datasetId) => {
  try {
    const currentPage = selectReactionsPagination(getState());
    const params = { page: currentPage.page, size: currentPage.size };

    const response = await axiosInstance.get<Pages<ReactionResponse>>(`/datasets/${datasetId}/reactions`, { params });

    return getReactionsListActions.success(parseReactionList(response.data));
  } catch (error) {
    console.error('Error fetching reactions list:', error);
    const errorData: RejectValue = handleApiError(error, _d);
    navigate('/404');
    throw errorData;
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

export const getReaction = createThunk(getReactionActions, async (dispatch, getState, { reactionId }) => {
  try {
    const state = getState();
    const datasetId = selectActiveDatasetId(state);
    const dataset = selectDatasetById(datasetId)(getState());

    if (!dataset) {
      await (dispatch as ThunkDispatch<AppState, never, Action>)(getDataset(datasetId));
    }

    const response = await axiosInstance.get<ReactionResponse>(`/datasets/${datasetId}/reactions/${reactionId}`);
    const parsedReaction = parseReaction(response.data);
    return getReactionActions.success(parsedReaction);
  } catch (error) {
    console.error('Error fetching reaction:', error);
    const errorData = handleApiError(error, dispatch);
    navigate('/404');
    throw errorData;
  }
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
    const updatedReactionData = selectReactionById(reactionId)(getState()).data;
    const { binpb: _, molblocks, ...reactionMetadata } = await updateReaction(reactionId, getState);
    const updatedReaction = {
      ...reactionMetadata,
      previews: getReactionPreviews(updatedReactionData, molblocks),
      molblocks,
    };

    dispatch(addUpdateReactionFieldActions.success(updatedReaction));
    showNotification({ message: 'Reaction updated.', variant: 'success' });
  },
);

export const deleteReactionField = createThunk(deleteReactionFieldActions, async (_d, getState, { reactionId }) => {
  await updateReaction(reactionId, getState);
  return deleteReactionFieldActions.success();
});

export const removeReaction = createThunkWithExplicitResult(
  removeReactionActions,
  async (dispatch, getState, reactionId) => {
    const datasetId = selectActiveDatasetId(getState());
    await axiosInstance.delete(`/datasets/${datasetId}/reactions/${reactionId}`);
    dispatch(removeReactionActions.success(reactionId));
    navigate(`/datasets/${datasetId}`);
  },
);
