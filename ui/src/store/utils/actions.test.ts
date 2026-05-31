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
import { createActionFactory, createAsyncAction } from './actions.ts';

describe('createAsyncAction', () => {
  it('derives request/success/failure action types from the base type', () => {
    const actions = createAsyncAction('reactions/load');
    expect(actions.request.type).toBe('reactions/load/request');
    expect(actions.success.type).toBe('reactions/load/success');
    expect(actions.failure.type).toBe('reactions/load/failure');
  });

  it('produces action creators that attach the payload', () => {
    const actions = createAsyncAction<number, string>('x');
    expect(actions.request(7)).toEqual({ type: 'x/request', payload: 7 });
    expect(actions.success('ok')).toEqual({ type: 'x/success', payload: 'ok' });
    const error = new Error('boom');
    expect(actions.failure(error)).toEqual({ type: 'x/failure', payload: error });
  });
});

describe('createActionFactory', () => {
  it('prefixes plain action types and round-trips the payload', () => {
    const factory = createActionFactory('templates');
    const action = factory.createAction<string>('rename');
    expect(action.type).toBe('templates/rename');
    expect(action('value')).toEqual({ type: 'templates/rename', payload: 'value' });
  });

  it('prefixes async action types and round-trips the request payload', () => {
    const factory = createActionFactory('templates');
    const actions = factory.createAsyncAction<number>('save');
    expect(actions.request.type).toBe('templates/save/request');
    expect(actions.success.type).toBe('templates/save/success');
    expect(actions.failure.type).toBe('templates/save/failure');
    expect(actions.request(3)).toEqual({ type: 'templates/save/request', payload: 3 });
  });
});
