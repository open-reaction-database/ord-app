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
import { enumerationReducer } from './enumeration.reducer.ts';
import {
  enumerateBatchActions,
  finishEnumerationAction,
  interruptEnumerationAction,
  startEnumerationActions,
} from './enumeration.actions.ts';
import type { StartEnumeration } from './enumeration.types.ts';

const startPayload: StartEnumeration = {
  dataset: 1,
  matching: [],
  templateCSV: { headers: [], content: [] },
  data: {} as StartEnumeration['data'],
  variables: [],
};

const start = () =>
  enumerationReducer(undefined, startEnumerationActions(startPayload));

describe('enumerationReducer', () => {
  it('starts with no progress', () => {
    expect(enumerationReducer(undefined, { type: '@@INIT' })).toEqual({
      enumerationProgress: null,
    });
  });

  it('initializes progress on start', () => {
    const state = start();
    expect(state.enumerationProgress).toMatchObject({
      dataset: 1,
      reactions: [],
      errors: [],
      index: 0,
      finished: false,
      resultDatasetId: null,
    });
  });

  describe('enumerateBatch success', () => {
    it('appends reactions and errors and advances the index by their combined count', () => {
      let state = start();
      state = enumerationReducer(
        state,
        enumerateBatchActions.success({
          reactions: ['r1', 'r2'],
          errors: [{ line: 3, message: 'bad' }],
        }),
      );
      expect(state.enumerationProgress).toMatchObject({
        reactions: ['r1', 'r2'],
        errors: [{ line: 3, message: 'bad' }],
        index: 3,
      });

      state = enumerationReducer(
        state,
        enumerateBatchActions.success({ reactions: ['r3'], errors: [] }),
      );
      expect(state.enumerationProgress?.reactions).toEqual(['r1', 'r2', 'r3']);
      expect(state.enumerationProgress?.index).toBe(4);
    });

    it('is a no-op when there is no active progress', () => {
      const state = enumerationReducer(
        undefined,
        enumerateBatchActions.success({ reactions: ['r1'], errors: [] }),
      );
      expect(state.enumerationProgress).toBeNull();
    });
  });

  describe('finishEnumeration', () => {
    it('marks progress finished and records the result dataset id', () => {
      let state = start();
      state = enumerationReducer(state, finishEnumerationAction(42));
      expect(state.enumerationProgress).toMatchObject({
        finished: true,
        resultDatasetId: 42,
      });
    });

    it('is a no-op when there is no active progress', () => {
      const state = enumerationReducer(undefined, finishEnumerationAction(42));
      expect(state.enumerationProgress).toBeNull();
    });
  });

  it('clears progress on interrupt', () => {
    let state = start();
    state = enumerationReducer(state, interruptEnumerationAction());
    expect(state.enumerationProgress).toBeNull();
  });
});
