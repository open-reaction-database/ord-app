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
  renameReactionActions,
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
  renameReactionActions.success,
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

/**
 * Renders the previews of reactions and templates as they arrive, and stores the SVGs.
 *
 * Renders can finish out of order (one with nothing to draw resolves at once), so each key
 * keeps only the result of the latest render that asked for it.
 */
export const previewsWorkerMiddleware: Middleware<object, AppState> = api => {
  let renders = 0;
  const latestRenderByKey = new Map<string, number>();

  /** The previews of `render` that no later render has asked for; their keys are settled. */
  const settle = (render: number, previewsById: PreviewsById): PreviewsById =>
    Object.fromEntries(
      Object.entries(previewsById).filter(([key]) => {
        if (latestRenderByKey.get(key) !== render) {
          return false;
        }
        latestRenderByKey.delete(key);
        return true;
      }),
    );

  const store = (render: number, previewsById: PreviewsById) => {
    const current = settle(render, previewsById);
    if (Object.keys(current).length > 0) {
      api.dispatch(setPreviewsByIds(current));
    }
  };

  return next => action => {
    if (typeof action === 'function') {
      return next(action);
    }
    const molblocksById = molblocksIn(action);
    if (molblocksById) {
      renders += 1;
      const render = renders;
      for (const key of Object.keys(molblocksById)) {
        latestRenderByKey.set(key, render);
      }
      void renderPreviews(molblocksById).then(
        svgsById => store(render, svgsById),
        // A failed render still ends the loading state; the previews show as missing.
        () => store(render, withoutPreviews(molblocksById)),
      );
    }
    return next(action);
  };
};
