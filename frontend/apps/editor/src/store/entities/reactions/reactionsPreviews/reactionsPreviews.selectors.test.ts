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
import {
  selectPreviewsByIds,
  selectPreviewsByIdsWrapper,
} from './reactionsPreviews.selectors.ts';
import type { PreviewStatesById } from './reactionsPreviews.types.ts';
import type { AppState } from 'store/configureAppStore.ts';

const buildState = (previewsByEntityId: PreviewStatesById): AppState =>
  ({
    entities: { reactions: { reactionsPreviews: { previewsByEntityId } } },
  }) as unknown as AppState;

const previews: PreviewStatesById = {
  a: { isLoading: false, svg: '<svg-a>' },
  b: { isLoading: true, svg: null },
};

describe('selectPreviewsByIds', () => {
  it('projects the requested ids into a map', () => {
    const state = buildState(previews);
    expect(selectPreviewsByIds(state, ['a', 'b'])).toEqual(previews);
  });

  it('yields undefined entries for ids that have no preview state', () => {
    const state = buildState(previews);
    expect(selectPreviewsByIds(state, ['a', 'missing'])).toEqual({
      a: { isLoading: false, svg: '<svg-a>' },
      missing: undefined,
    });
  });
});

describe('selectPreviewsByIdsWrapper', () => {
  it('binds the entity ids and reads from state', () => {
    const state = buildState(previews);
    expect(selectPreviewsByIdsWrapper(['b'])(state)).toEqual({
      b: { isLoading: true, svg: null },
    });
  });
});
