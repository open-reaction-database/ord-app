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
  searchReactionActions,
} from './reactions.actions.ts';
import axiosInstance from 'store/axiosInstance.ts';
import type { Pages } from 'common/types';
import type {
  AppReaction,
  DatasetReaction,
  ReactionId,
  ReactionMolBlocks,
  ReactionResponse,
  ReactionValidation,
  UpdateReactionSuccessPayload,
} from './reactions.types.ts';
import { selectActiveDatasetId, selectReactionById, selectReactionsPagination } from './reactions.selectors.ts';
import { navigate } from 'wouter/use-browser-location';
import type { AppState } from '../../configureAppStore.ts';
import { ord } from 'ord-schema-protobufjs';
import { Buffer } from 'buffer';
import {
  convertReactionFloatsToDoubles,
  ordReactionToReaction,
  reactionToOrdReaction,
} from './reactions.converters.ts';
import { showNotification } from 'common/utils/showNotification.tsx';
import type { ReactionInput } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import type { PreviewsById } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.types.ts';
import { handleApiError } from 'store/utils/handleApiError.ts';
import type { Action, ThunkDispatch } from '@reduxjs/toolkit';
import { getDataset } from '../datasets/datasets.thunks.ts';
import { selectDatasetById } from '../datasets/datasets.selectors.ts';
import { NotificationVariant } from 'common/types/notification.ts';

export const getReactionPreviews = (reaction: AppReaction, molblocks: ReactionMolBlocks): PreviewsById => {
  const inputsArray = Object.values(reaction.inputs);
  const inputsPreviews: PreviewsById = Object.entries(molblocks.inputs).reduce(
    (acc: PreviewsById, [inputName, input]) => ({
      ...acc,
      ...input.reduce((acc: PreviewsById, item, index) => {
        const component = (inputsArray.find(item => item.name === inputName) as ReactionInput).components[index];
        return {
          ...acc,
          [component.id]: item,
        };
      }, {}),
    }),
    {},
  );

  const outcomesPreviews: PreviewsById = molblocks.outcomes.reduce(
    (acc: PreviewsById, { products }, outcomeIndex) => ({
      ...acc,
      ...products.reduce((acc: PreviewsById, item, productIndex) => {
        const product = reaction.outcomes[outcomeIndex].products[productIndex];
        return {
          ...acc,
          [product.id]: item.molblock,
          ...item.measurements.reduce((acc: PreviewsById, measurementMolblock, index) => {
            const measurement = product.measurements[index];
            return measurement.authenticStandard
              ? {
                  ...acc,
                  [measurement.authenticStandard.id]: measurementMolblock.authentic_standard.molblock,
                }
              : acc;
          }, {}),
        };
      }, {}),
    }),
    {},
  );
  return { ...inputsPreviews, ...outcomesPreviews };
};

const protobufClassRegExp = /<class '.+'> /g;

const parseValidation = (validation: ReactionValidation): ReactionValidation => {
  return {
    errors: validation.errors.map(item => item.replace(protobufClassRegExp, '')),
    warnings: validation.warnings.map(item => item.replace(protobufClassRegExp, '')),
  };
};

const parseReaction = ({ binpb, molblocks, validation, ...rest }: ReactionResponse): DatasetReaction => {
  const parsedProtobuf = ord.Reaction.decode(Buffer.from(binpb, 'base64'));
  const appReaction = ordReactionToReaction(ord.Reaction.toObject(parsedProtobuf));
  convertReactionFloatsToDoubles(appReaction);
  const previews = getReactionPreviews(appReaction, molblocks);
  const updatedValidation = validation ? parseValidation(validation) : null;

  return {
    ...rest,
    previews,
    data: appReaction,
    validation: updatedValidation,
  };
};

const parseReactionList = (pages: Pages<ReactionResponse>): Pages<DatasetReaction> => {
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

export const addUpdateReactionField = createThunkWithExplicitResult(
  addUpdateReactionFieldActions,
  async (dispatch, getState, { reactionId }) => {
    const result = await updateReaction(reactionId, getState);
    dispatch(addUpdateReactionFieldActions.success(result));
    showNotification({ message: 'Reaction updated.', variant: NotificationVariant.SUCCESS });
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
