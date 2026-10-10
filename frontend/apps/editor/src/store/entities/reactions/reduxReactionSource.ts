/*
 * Copyright 2026 Open Reaction Database Project Authors
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
import type { Action, Store, ThunkDispatch } from '@reduxjs/toolkit';
import type {
  ReactionActions,
  ReactionSource,
} from 'features/reactions/provider/reactionProvider.types.ts';
import type { AppState } from 'store/configureAppStore.ts';
import { selectReactionById } from './reactions.selectors.ts';
import { addUpdateReactionField, deleteReactionField } from './reactions.thunks.ts';
import type { ReactionId } from './reactions.types.ts';
import { selectReactionsPreviews } from './reactionsPreviews/reactionsPreviews.selectors.ts';

/** Reads one reaction, dataset or template, and the rendered previews from the editor's store. */
export function reduxReactionSource(
  store: Pick<Store<AppState>, 'getState' | 'subscribe'>,
  reactionId: ReactionId,
): ReactionSource {
  return {
    getSnapshot: () => selectReactionById(reactionId)(store.getState()),
    getPreviews: () => selectReactionsPreviews(store.getState()),
    subscribe: listener => store.subscribe(listener),
  };
}

/**
 * Edits one reaction through the thunks that apply a change optimistically and save it.
 *
 * The thunks are async, so dispatching one returns a promise, though `ThunkWrapper` types
 * the result as void; awaiting it makes each action settle when the save does.
 */
export function reduxReactionActions(
  dispatch: ThunkDispatch<AppState, never, Action>,
  reactionId: ReactionId,
): ReactionActions {
  return {
    update: async (pathComponents, newValue) => {
      await dispatch(addUpdateReactionField({ reactionId, pathComponents, newValue }));
    },
    remove: async pathComponents => {
      await dispatch(deleteReactionField({ reactionId, pathComponents }));
    },
  };
}
