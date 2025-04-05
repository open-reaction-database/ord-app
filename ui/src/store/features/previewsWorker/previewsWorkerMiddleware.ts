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
import { isAnyOf, type Middleware } from '@reduxjs/toolkit';
import type { AppState } from 'store/configureAppStore.ts';
import {
  addUpdateReactionFieldActions,
  deleteReactionFieldActions,
  getReactionActions,
  getReactionPageActions,
  getReactionsListActions,
} from 'store/entities/reactions/reactions.actions.ts';
import {
  getAllTemplatesActions,
  createNewTemplateActions,
  importTemplateFromFileActions,
  renameTemplateActions,
} from 'store/entities/templates/templates.actions.ts';
import { setPreviewsByIds } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.actions.ts';
import type { PreviewsById } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.types.ts';

const singleReactionActionsMatcher = isAnyOf(
  getReactionActions.success,
  addUpdateReactionFieldActions.success,
  deleteReactionFieldActions.success,
  createNewTemplateActions.success,
  importTemplateFromFileActions.success,
  renameTemplateActions.success,
);

const multipleReactionsActionsMatcher = isAnyOf(
  getReactionsListActions.success,
  getReactionPageActions.success,
  getAllTemplatesActions.success,
);

export const previewsWorkerMiddleware: Middleware<object, AppState> = api => {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  worker.onmessage = event => {
    const previews: PreviewsById = event.data;
    api.dispatch(setPreviewsByIds(previews));
  };

  return next => action => {
    if (typeof action === 'function') {
      return next(action);
    }

    if (singleReactionActionsMatcher(action)) {
      worker.postMessage(action.payload.previews);
    }

    if (multipleReactionsActionsMatcher(action)) {
      let previews: PreviewsById = {};
      if (getAllTemplatesActions.success.match(action)) {
        previews = action.payload.reduce((acc, template) => ({ ...acc, ...template.previews }), {});
      } else {
        previews = action.payload.items.reduce((acc, reaction) => ({ ...acc, ...reaction.previews }), {});
      }
      worker.postMessage(previews);
    }

    return next(action);
  };
};
