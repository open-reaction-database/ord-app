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
import { createSelectorFactory } from 'store/utils';
import { createSelector } from '@reduxjs/toolkit';
import type { AppState } from 'store/configureAppStore.ts';
import type { PreviewStatesById } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.types.ts';

const { buildSelector } = createSelectorFactory(state => state.entities.reactions.reactionsPreviews);

export const selectReactionsPreviews = buildSelector(state => state.previewsByEntityId);

export const selectPreviewsIds = (_state: unknown, entityIds: Array<string>) => entityIds;

export const selectPreviewsByIds = createSelector(
  [selectReactionsPreviews, selectPreviewsIds],
  (previews, ids): PreviewStatesById =>
    ids?.reduce(
      (acc, id) => ({
        ...acc,
        [id]: previews[id],
      }),
      {},
    ),
);

export const selectPreviewsByIdsWrapper = (entityIds: Array<string>) => (state: AppState) =>
  selectPreviewsByIds(state, entityIds);
