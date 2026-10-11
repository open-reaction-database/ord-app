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
import {
  renderPreviews,
  type PreviewsById,
} from '@open-reaction-database/ui/reaction/previews';
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

/** The molblocks an action brings in, keyed by component ID, or undefined if it brings none. */
function molblocksIn(action: unknown): PreviewsById | undefined {
  if (singleReactionActionsMatcher(action)) {
    return action.payload.previews;
  }
  if (multipleReactionsActionsMatcher(action)) {
    if (getAllTemplatesActions.success.match(action)) {
      return action.payload.reduce(
        (acc, template) => ({ ...acc, ...template.previews }),
        {},
      );
    }
    return action.payload.items.reduce(
      (acc, reaction) => ({ ...acc, ...reaction.previews }),
      {},
    );
  }
  return undefined;
}

function withoutPreviews(molblocksById: PreviewsById): PreviewsById {
  return Object.fromEntries(Object.keys(molblocksById).map(key => [key, null]));
}

/** Renders the previews of reactions and templates as they arrive, and stores the SVGs. */
export const previewsWorkerMiddleware: Middleware<object, AppState> =
  api => next => action => {
    if (typeof action === 'function') {
      return next(action);
    }
    const molblocksById = molblocksIn(action);
    if (molblocksById) {
      void renderPreviews(molblocksById).then(
        svgsById => api.dispatch(setPreviewsByIds(svgsById)),
        // A failed render still ends the loading state; the previews show as missing.
        () => api.dispatch(setPreviewsByIds(withoutPreviews(molblocksById))),
      );
    }
    return next(action);
  };
