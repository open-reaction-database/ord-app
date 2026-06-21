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
import { describe, it, expect } from 'vitest';
import { reactionsPreviewsReducer } from './reactionsPreviews.reducer.ts';
import { setPreviewsByIds } from './reactionsPreviews.actions.ts';
import {
  addUpdateReactionFieldActions,
  getReactionActions,
  getReactionsListActions,
} from 'store/entities/reactions/reactions.actions.ts';
import type { PreviewsById } from './reactionsPreviews.types.ts';
import type {
  DatasetReaction,
  UpdateReactionSuccessPayload,
} from 'store/entities/reactions/reactions.types.ts';
import type { Pages } from 'common/types';

const reactionWithPreviews = (previews: PreviewsById) =>
  ({ previews }) as DatasetReaction;

const initialState = () => reactionsPreviewsReducer(undefined, { type: '@@INIT' });

describe('reactionsPreviewsReducer', () => {
  it('starts empty', () => {
    expect(initialState()).toEqual({ previewsByEntityId: {} });
  });

  describe('setPreviewsByIds', () => {
    it('stores resolved (not loading) previews, keyed by id, with null svgs preserved', () => {
      const state = reactionsPreviewsReducer(
        initialState(),
        setPreviewsByIds({ a: '<svg-a>', b: null }),
      );
      expect(state.previewsByEntityId).toEqual({
        a: { isLoading: false, svg: '<svg-a>' },
        b: { isLoading: false, svg: null },
      });
    });
  });

  describe('updatePreviewState (get reaction / add-update field success)', () => {
    it('marks non-null previews loading while preserving any existing svg, and clears null previews', () => {
      // seed an already-rendered preview for "a"
      let state = reactionsPreviewsReducer(
        initialState(),
        setPreviewsByIds({ a: '<svg-a>' }),
      );
      state = reactionsPreviewsReducer(
        state,
        getReactionActions.success(reactionWithPreviews({ a: 'ref', b: null })),
      );
      // "a" keeps its previously rendered svg but flips to loading; "b" resets to empty
      expect(state.previewsByEntityId.a).toEqual({ isLoading: true, svg: '<svg-a>' });
      expect(state.previewsByEntityId.b).toEqual({ isLoading: false, svg: null });
    });

    it('handles the add-update-field success payload the same way', () => {
      const payload = {
        previews: { c: 'ref' },
      } as unknown as UpdateReactionSuccessPayload;
      const state = reactionsPreviewsReducer(
        initialState(),
        addUpdateReactionFieldActions.success(payload),
      );
      expect(state.previewsByEntityId.c).toEqual({ isLoading: true });
    });
  });

  describe('getReactionsListActions.success', () => {
    it('merges previews across all returned reactions', () => {
      const page = {
        items: [reactionWithPreviews({ a: 'ref' }), reactionWithPreviews({ b: null })],
        page: 1,
        size: 10,
        total: 2,
        pages: 1,
      } as Pages<DatasetReaction>;
      const state = reactionsPreviewsReducer(
        initialState(),
        getReactionsListActions.success(page),
      );
      expect(state.previewsByEntityId).toEqual({
        a: { isLoading: true },
        b: { isLoading: false, svg: null },
      });
    });
  });
});
