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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MiddlewareAPI } from '@reduxjs/toolkit';
import { enumerationWorkerMiddleware } from './enumerationWorkerMiddleware.ts';
import { enumerateBatchActions } from 'store/entities/enumeration/enumeration.actions.ts';
import type { EnumerationBatchResult } from 'store/entities/enumeration/enumeration.types.ts';

interface CapturedWorker {
  postMessage: ReturnType<typeof vi.fn>;
  onmessage: ((event: { data: unknown }) => void) | null;
  onerror: ((error: unknown) => void) | null;
}

let workers: Array<CapturedWorker>;

class MockWorker {
  postMessage = vi.fn();
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: ((error: unknown) => void) | null = null;
  constructor() {
    workers.push(this);
  }
}

function setup() {
  const dispatch = vi.fn((action: unknown) => action);
  const api = { dispatch, getState: vi.fn() } as unknown as MiddlewareAPI;
  const next = vi.fn((action: unknown) => action);
  const invoke = enumerationWorkerMiddleware(api)(next) as (action: unknown) => unknown;
  return { dispatch, next, invoke, worker: workers[0] };
}

const batchRequest = { index: 0, data: {}, variables: [], matching: [], templateCSV: { headers: [], content: [] } };

beforeEach(() => {
  workers = [];
  vi.stubGlobal('Worker', MockWorker);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('enumerationWorkerMiddleware', () => {
  it('passes thunk (function) actions straight through without posting to the worker', () => {
    const { invoke, next, worker } = setup();
    const thunk = () => undefined;
    invoke(thunk);
    expect(next).toHaveBeenCalledWith(thunk);
    expect(worker.postMessage).not.toHaveBeenCalled();
  });

  it('posts the payload to the worker for a batch-request action and forwards it', () => {
    const { invoke, next, worker } = setup();
    // The middleware matches by action.type and forwards payload verbatim, so a
    // plain {type, payload} literal exercises it without a full request payload.
    const action = { type: enumerateBatchActions.request.type, payload: batchRequest };
    invoke(action);
    expect(worker.postMessage).toHaveBeenCalledWith(batchRequest);
    expect(next).toHaveBeenCalledWith(action);
  });

  it('does not post unrelated actions but still forwards them', () => {
    const { invoke, next, worker } = setup();
    const action = { type: 'something/unrelated' };
    invoke(action);
    expect(worker.postMessage).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(action);
  });

  it('dispatches the batch result when the worker posts a message back', () => {
    const { dispatch, worker } = setup();
    const result: EnumerationBatchResult = { reactions: ['enc'], errors: [] };
    worker.onmessage?.({ data: result });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('logs worker errors without throwing', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const { worker } = setup();
    expect(() => worker.onerror?.(new Error('boom'))).not.toThrow();
    expect(infoSpy).toHaveBeenCalledWith('Error in WebWorker', expect.any(Error));
    infoSpy.mockRestore();
  });
});
