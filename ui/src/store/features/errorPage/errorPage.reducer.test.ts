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
import { errorPageReducer } from './errorPage.reducer.ts';
import { resetErrorPageAction } from './errorPage.actions.ts';
import { getDatasetActions } from 'store/entities/datasets/datasets.actions.ts';
import { getReactionActions, getReactionsListActions } from 'store/entities/reactions/reactions.actions.ts';
import type { RejectValue } from 'store/utils/handleApiError.ts';

const reject: RejectValue = { errorCode: 404, errorMessage: 'Entity not found' };

const initialState = () => errorPageReducer(undefined, { type: '@@INIT' });

describe('errorPageReducer', () => {
  it('starts with no error', () => {
    expect(initialState()).toEqual({ error: null });
  });

  it('captures the failure payload from dataset, reaction, and reaction-list failures', () => {
    expect(errorPageReducer(initialState(), getDatasetActions.failure(reject)).error).toEqual(reject);
    expect(errorPageReducer(initialState(), getReactionActions.failure(reject)).error).toEqual(reject);
    expect(errorPageReducer(initialState(), getReactionsListActions.failure(reject)).error).toEqual(reject);
  });

  it('clears the error on reset', () => {
    let state = errorPageReducer(initialState(), getDatasetActions.failure(reject));
    expect(state.error).toEqual(reject);
    state = errorPageReducer(state, resetErrorPageAction());
    expect(state.error).toBeNull();
  });
});
