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
import { templatesReducer } from './templates.reducer.ts';
import {
  createNewTemplateActions,
  getAllTemplatesActions,
  getTemplateActions,
  importTemplateFromFileActions,
  removeTemplateActions,
} from './templates.actions.ts';
import type { ReactionTemplate } from 'store/entities/reactions/reactions.types.ts';

// The reducer only reads `template.id`, so a minimal stub keeps the test focused.
const makeTemplate = (id: string): ReactionTemplate =>
  ({ id, name: `template-${id}` }) as ReactionTemplate;

const initialState = () => templatesReducer(undefined, { type: '@@INIT' });

describe('templatesReducer', () => {
  it('returns the initial state', () => {
    expect(initialState()).toEqual({
      templatesOrder: [],
      isTemplateCreating: false,
      areTemplatesLoaded: false,
    });
  });

  describe('areTemplatesLoaded', () => {
    it('is false initially and flips to true once the full list is fetched (#496)', () => {
      expect(initialState().areTemplatesLoaded).toBe(false);
      const state = templatesReducer(
        initialState(),
        getAllTemplatesActions.success([makeTemplate('a')]),
      );
      expect(state.areTemplatesLoaded).toBe(true);
    });

    it('also settles to true when the fetch fails, so the 404 path still reaches the user (#496)', () => {
      const state = templatesReducer(
        initialState(),
        getAllTemplatesActions.failure(new Error('network')),
      );
      expect(state.areTemplatesLoaded).toBe(true);
    });
  });

  describe('templatesOrder', () => {
    it('records the order of ids from a full fetch', () => {
      const state = templatesReducer(
        initialState(),
        getAllTemplatesActions.success([
          makeTemplate('a'),
          makeTemplate('b'),
          makeTemplate('c'),
        ]),
      );
      expect(state.templatesOrder).toEqual(['a', 'b', 'c']);
    });

    it('removes the deleted template id', () => {
      let state = templatesReducer(
        initialState(),
        getAllTemplatesActions.success([makeTemplate('a'), makeTemplate('b')]),
      );
      state = templatesReducer(state, removeTemplateActions.success('a'));
      expect(state.templatesOrder).toEqual(['b']);
    });

    it('prepends newly created and imported templates', () => {
      let state = templatesReducer(
        initialState(),
        getAllTemplatesActions.success([makeTemplate('a')]),
      );
      state = templatesReducer(
        state,
        createNewTemplateActions.success(makeTemplate('b')),
      );
      state = templatesReducer(
        state,
        importTemplateFromFileActions.success(makeTemplate('c')),
      );
      expect(state.templatesOrder).toEqual(['c', 'b', 'a']);
    });
  });

  // One case per request/resolve pair so each reset branch of the isAnyOf matcher is
  // independently covered (create success, create failure, get success, get failure).
  describe('isTemplateCreating', () => {
    it('toggles around the create flow (request -> success)', () => {
      let state = templatesReducer(
        initialState(),
        createNewTemplateActions.request({} as never),
      );
      expect(state.isTemplateCreating).toBe(true);
      state = templatesReducer(
        state,
        createNewTemplateActions.success(makeTemplate('a')),
      );
      expect(state.isTemplateCreating).toBe(false);
    });

    it('toggles around the create flow (request -> failure)', () => {
      let state = templatesReducer(
        initialState(),
        createNewTemplateActions.request({} as never),
      );
      expect(state.isTemplateCreating).toBe(true);
      state = templatesReducer(state, createNewTemplateActions.failure(new Error('x')));
      expect(state.isTemplateCreating).toBe(false);
    });

    it('toggles around the get flow (request -> success)', () => {
      let state = templatesReducer(initialState(), getTemplateActions.request(1));
      expect(state.isTemplateCreating).toBe(true);
      state = templatesReducer(state, getTemplateActions.success(makeTemplate('a')));
      expect(state.isTemplateCreating).toBe(false);
    });

    it('toggles around the get flow (request -> failure)', () => {
      let state = templatesReducer(initialState(), getTemplateActions.request(1));
      expect(state.isTemplateCreating).toBe(true);
      state = templatesReducer(state, getTemplateActions.failure(new Error('x')));
      expect(state.isTemplateCreating).toBe(false);
    });
  });
});
