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
import { createThunk } from '../../common/store';
import { getReactionActions, getReactionPageActions, getReactionsListActions } from './reactions.actions';
import axiosInstance from '../../common/config/axiosConfig';
import type { Pages } from '../../common/types';
import type { ReactionResponse, ReactionWrapper } from './reactions.types';
import ordSchema from 'ord-schema';
import { selectActiveDatasetId, selectReactionsPagination } from './reactions.selectors';

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
