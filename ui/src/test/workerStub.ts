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
import { expect, it, vi } from 'vitest';
import type { MiddlewareAPI } from '@reduxjs/toolkit';

/** A recorded Worker instance: posted messages plus the handlers the middleware assigns. */
export interface CapturedWorker {
  postMessage: ReturnType<typeof vi.fn>;
  onmessage: ((event: { data: unknown }) => void) | null;
  onerror: ((error: unknown) => void) | null;
}

/** Handles a worker-middleware test drives: the recorded worker plus the dispatch/next spies. */
export interface WorkerMiddlewareHandles {
  dispatch: ReturnType<typeof vi.fn>;
  next: ReturnType<typeof vi.fn>;
  invoke: (action: unknown) => unknown;
  worker: CapturedWorker;
}

/**
 * Replace the global Worker constructor with a recorder for worker-middleware tests.
 *
 * Worker (and module workers via `new URL(..., import.meta.url)`) can't run under
 * vitest, so the stub records each instance the code under test constructs and
 * exposes its postMessage spy plus the onmessage/onerror handlers the middleware
 * assigns. Pair with `vi.unstubAllGlobals()` in afterEach to restore the global.
 *
 * Returns:
 *   The array that captures Worker instances in construction order.
 */
export function stubWorker(): Array<CapturedWorker> {
  const workers: Array<CapturedWorker> = [];
  class MockWorker {
    postMessage = vi.fn();
    onmessage: CapturedWorker['onmessage'] = null;
    onerror: CapturedWorker['onerror'] = null;
    constructor() {
      workers.push(this);
    }
  }
  vi.stubGlobal('Worker', MockWorker);
  return workers;
}

/**
 * Stub the Worker global and build the api/next/dispatch spies a worker middleware needs.
 *
 * The caller applies its own middleware to the returned ``api``/``next`` so the
 * middleware's specific dispatch type is preserved. Restore the global with
 * ``vi.unstubAllGlobals()`` in afterEach.
 *
 * Returns:
 *   The captured-worker array plus the dispatch/next spies and a MiddlewareAPI.
 */
export function createWorkerHarness(): {
  workers: Array<CapturedWorker>;
  dispatch: ReturnType<typeof vi.fn>;
  next: ReturnType<typeof vi.fn>;
  api: MiddlewareAPI;
} {
  const workers = stubWorker();
  const dispatch = vi.fn((action: unknown) => action);
  const next = vi.fn((action: unknown) => action);
  const api = { dispatch, getState: vi.fn() } as unknown as MiddlewareAPI;
  return { workers, dispatch, next, api };
}

/**
 * Register the passthrough behavior every worker middleware shares.
 *
 * Both worker middlewares forward thunk (function) actions and unrelated actions
 * to ``next`` without posting to the worker; this declares those two ``it`` cases
 * once. Call it inside the middleware's ``describe`` block.
 *
 * Args:
 *     setup: Builds fresh handles (stubbed worker + applied middleware) per test.
 */
export function itForwardsNonWorkerActions(setup: () => WorkerMiddlewareHandles): void {
  it('passes thunk (function) actions straight through without posting to the worker', () => {
    const { invoke, next, worker } = setup();
    const thunk = () => undefined;
    invoke(thunk);
    expect(next).toHaveBeenCalledWith(thunk);
    expect(worker.postMessage).not.toHaveBeenCalled();
  });

  it('does not post unrelated actions but still forwards them', () => {
    const { invoke, next, worker } = setup();
    const unrelated = { type: 'unrelated/action' };
    invoke(unrelated);
    expect(worker.postMessage).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(unrelated);
  });
}
