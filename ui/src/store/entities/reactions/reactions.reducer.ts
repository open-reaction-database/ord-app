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
import { combineReducers, createReducer, isAnyOf } from '@reduxjs/toolkit';
import {
  createEmptyReactionActions,
  getReactionActions,
  getReactionPageActions,
  getReactionsListActions,
  importReactionFromFileActions,
  addUpdateReactionFieldActions,
  deleteReactionFieldActions,
  removeReactionActions,
} from './reactions.actions.ts';
import {
  getTemplateActions,
  getAllTemplatesActions,
  removeTemplateActions,
  renameTemplateActions,
} from 'store/entities/templates/templates.actions.ts';
import { itemsById } from 'common/utils';
import type { ReactionOrTemplate, AppReaction, DatasetReaction, ReactionTemplate } from './reactions.types.ts';
import type { ItemsById, Pagination } from 'common/types';
import { emptyPagination } from 'common/constants.ts';
import {
  deepMergeWithArrayMerge,
  generateDeepPartialReactionByPath,
  removeDeepReactionPart,
} from './reactions.utils.ts';
import { reactionsPreviewsReducer } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.reducer.ts';
import { linkReactionEntities } from 'store/entities/reactions/reactions.converters.ts';

const getReactionId = (reaction: DatasetReaction) => reaction.id;

const getTemplateId = (template: ReactionTemplate) => template.id;

const activeDatasetId = createReducer<number>(0, builder => {
  builder.addCase(getReactionActions.request, (_, action) => action.payload.datasetId);
  builder.addCase(getReactionsListActions.request, (_, action) => action.payload);
});

const reactionsById = createReducer<ItemsById<ReactionOrTemplate>>({}, builder => {
  builder.addCase(
    addUpdateReactionFieldActions.request,
    (state, { payload: { reactionId, pathComponents, newValue } }) => {
      const reaction = state[reactionId];
      const updatedReaction: AppReaction = linkReactionEntities(
        deepMergeWithArrayMerge(
          reaction.data,
          generateDeepPartialReactionByPath(pathComponents, newValue) as unknown as AppReaction,
        ),
      );
      return {
        ...state,
        [reactionId]: {
          ...reaction,
          data: updatedReaction,
        },
      };
    },
  );
  builder.addCase(deleteReactionFieldActions.request, (state, { payload: { reactionId, pathComponents } }) => {
    const reaction = state[reactionId];
    const updatedReaction: AppReaction = linkReactionEntities(removeDeepReactionPart(reaction.data, pathComponents));
    return {
      ...state,
      [reactionId]: {
        ...reaction,
        data: updatedReaction,
      },
    };
  });
  builder.addCase(removeReactionActions.success, (state, { payload: reactionId }) => {
    const { [reactionId]: _, ...rest } = state;
    return rest;
  });
  builder.addCase(removeTemplateActions.success, (state, { payload: templateId }) => {
    const { [`template_${templateId}`]: _, ...rest } = state;
    return rest;
  });
  builder.addCase(getTemplateActions.success, (state, action) => ({
    ...state,
    [getTemplateId(action.payload)]: {
      ...action.payload,
      data: linkReactionEntities(action.payload.data),
    },
  }));
  builder.addCase(getAllTemplatesActions.success, (state, action) => ({
    ...state,
    ...itemsById(
      action.payload.map(item => ({ ...item, data: linkReactionEntities(item.data) })),
      getTemplateId,
    ),
  }));
  builder.addCase(renameTemplateActions.success, (state, action) => {
    return {
      ...state,
      [action.payload.id]: action.payload,
    };
  });
  builder.addMatcher(
    isAnyOf(addUpdateReactionFieldActions.success, deleteReactionFieldActions.success),
    (state, { payload }) => {
      const { id } = payload;
      const { data } = state[id];
      return {
        ...state,
        [id]: {
          ...payload,
          data,
        },
      };
    },
  );
  builder.addMatcher(
    isAnyOf(getReactionActions.success, createEmptyReactionActions.success, importReactionFromFileActions.success),
    (state, action) => ({
      ...state,
      [getReactionId(action.payload)]: {
        ...action.payload,
        data: linkReactionEntities(action.payload.data),
      },
    }),
  );
  builder.addMatcher(isAnyOf(getReactionsListActions.success, getReactionPageActions.success), (state, action) => ({
    ...state,
    ...itemsById(
      action.payload.items.map(item => ({ ...item, data: linkReactionEntities(item.data) })),
      getReactionId,
    ),
  }));
});

const reactionsOrder = createReducer<Array<number>>([], builder => {
  builder.addCase(getReactionsListActions.request, () => []);
  builder.addCase(removeReactionActions.success, (state, { payload: reactionId }) =>
    state.filter(id => id !== reactionId),
  );
  builder.addMatcher(isAnyOf(getReactionsListActions.request, getReactionPageActions.request), () => []);
  builder.addMatcher(isAnyOf(getReactionsListActions.success, getReactionPageActions.success), (_, action) =>
    action.payload.items.map(getReactionId),
  );
});

const pagination = createReducer<Pagination>(emptyPagination, builder => {
  builder.addCase(getReactionsListActions.request, () => emptyPagination);
  builder.addCase(getReactionPageActions.request, (state, action) => ({ ...state, ...action.payload }));
  builder.addMatcher(isAnyOf(getReactionsListActions.success, getReactionPageActions.success), (state, action) => ({
    ...state,
    total: action.payload.total,
    pages: action.payload.pages,
  }));
  builder.addMatcher(isAnyOf(createEmptyReactionActions.success, importReactionFromFileActions.success), state => ({
    ...state,
    total: state.total + 1,
    pages: Math.ceil((state.total + 1) / state.size),
  }));
  builder.addMatcher(isAnyOf(removeReactionActions.success), state => ({
    ...state,
    total: state.total - 1,
    pages: Math.ceil((state.total - 1) / state.size),
  }));
});

const isReactionCreating = createReducer<boolean>(false, builder => {
  builder.addMatcher(isAnyOf(createEmptyReactionActions.request, importReactionFromFileActions.request), () => true);
  builder.addMatcher(
    isAnyOf(
      createEmptyReactionActions.success,
      createEmptyReactionActions.failure,
      importReactionFromFileActions.success,
      importReactionFromFileActions.failure,
    ),
    () => false,
  );
});

const areReactionsLoading = createReducer<boolean>(false, builder => {
  builder.addMatcher(isAnyOf(getReactionsListActions.request, getReactionPageActions.request), () => true);
  builder.addMatcher(
    isAnyOf(
      getReactionsListActions.success,
      getReactionsListActions.failure,
      getReactionPageActions.success,
      getReactionPageActions.failure,
    ),
    () => false,
  );
});

export const reactionsReducer = combineReducers({
  reactionsById,
  reactionsOrder,
  pagination,
  activeDatasetId,
  isReactionCreating,
  areReactionsLoading,
  reactionsPreviews: reactionsPreviewsReducer,
});
