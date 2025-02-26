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
import type { PreviewsById, PreviewStatesById } from './reactionsPreviews.types.ts';
import {
  addUpdateReactionFieldActions,
  getReactionActions,
  getReactionsListActions,
} from 'store/entities/reactions/reactions.actions.ts';
import { setPreviewsByIds } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.actions.ts';

const updatePreviewState = (state: PreviewStatesById, previewsById: PreviewsById): PreviewStatesById => ({
  ...state,
  ...Object.entries(previewsById).reduce(
    (acc: PreviewStatesById, [key, value]) => ({
      ...acc,
      [key]:
        value === null
          ? { isLoading: false, svg: null }
          : {
              ...(state[key] || {}),
              isLoading: true,
            },
    }),
    {},
  ),
});

const previewsByEntityId = createReducer<PreviewStatesById>({}, builder => {
  builder.addCase(setPreviewsByIds, (state, action) => ({
    ...state,
    ...Object.entries(action.payload).reduce(
      (acc: PreviewStatesById, [key, value]) => ({
        ...acc,
        [key]: {
          isLoading: false,
          svg: value,
        },
      }),
      {},
    ),
  }));

  builder.addCase(getReactionsListActions.success, (state, { payload }) => {
    const previewsByIds = payload.items.reduce((acc, item) => ({ ...acc, ...item.previews }), {});
    return updatePreviewState(state, previewsByIds);
  });

  builder.addMatcher(isAnyOf(getReactionActions.success, addUpdateReactionFieldActions.success), (state, { payload }) =>
    updatePreviewState(state, payload.previews),
  );
});

export const reactionsPreviewsReducer = combineReducers({
  previewsByEntityId,
});
