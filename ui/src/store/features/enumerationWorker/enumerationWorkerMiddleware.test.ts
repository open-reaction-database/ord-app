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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { enumerationWorkerMiddleware } from './enumerationWorkerMiddleware.ts';
import { enumerateBatchActions } from 'store/entities/enumeration/enumeration.actions.ts';
import type { EnumerationBatchResult } from 'store/entities/enumeration/enumeration.types.ts';
import { createWorkerHarness, itForwardsNonWorkerActions } from 'test/workerStub.ts';

function setup() {
  const { workers, dispatch, next, api } = createWorkerHarness();
  const invoke = enumerationWorkerMiddleware(api)(next) as (action: unknown) => unknown;
  return { dispatch, next, invoke, worker: workers[0] };
}

const batchRequest = { index: 0, data: {}, variables: [], matching: [], templateCSV: { headers: [], content: [] } };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('enumerationWorkerMiddleware', () => {
  itForwardsNonWorkerActions(setup);

  it('posts the payload to the worker for a batch-request action and forwards it', () => {
    const { invoke, next, worker } = setup();
    // The middleware matches by action.type and forwards payload verbatim, so a
    // plain {type, payload} literal exercises it without a full request payload.
    const action = { type: enumerateBatchActions.request.type, payload: batchRequest };
    invoke(action);
    expect(worker.postMessage).toHaveBeenCalledWith(batchRequest);
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
