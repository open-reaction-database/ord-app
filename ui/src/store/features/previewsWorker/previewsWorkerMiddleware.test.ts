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
import type { MiddlewareAPI, UnknownAction } from '@reduxjs/toolkit';
import { previewsWorkerMiddleware } from './previewsWorkerMiddleware.ts';
import {
  getReactionActions,
  getReactionPageActions,
  getReactionsListActions,
} from 'store/entities/reactions/reactions.actions.ts';
import { getAllTemplatesActions } from 'store/entities/templates/templates.actions.ts';
import { setPreviewsByIds } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.actions.ts';

interface CapturedWorker {
  postMessage: ReturnType<typeof vi.fn>;
  onmessage: ((event: { data: unknown }) => void) | null;
}

let workers: Array<CapturedWorker>;

class MockWorker {
  postMessage = vi.fn();
  onmessage: ((event: { data: unknown }) => void) | null = null;
  constructor() {
    workers.push(this);
  }
}

function setup() {
  const dispatch = vi.fn((action: unknown) => action);
  const api = { dispatch, getState: vi.fn() } as unknown as MiddlewareAPI;
  const next = vi.fn((action: unknown) => action);
  const invoke = previewsWorkerMiddleware(api)(next) as (action: unknown) => unknown;
  return { dispatch, next, invoke, worker: workers[0] };
}

beforeEach(() => {
  workers = [];
  vi.stubGlobal('Worker', MockWorker);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('previewsWorkerMiddleware', () => {
  it('passes thunk (function) actions straight through without posting to the worker', () => {
    const { invoke, next, worker } = setup();
    const thunk = () => undefined;
    invoke(thunk);
    expect(next).toHaveBeenCalledWith(thunk);
    expect(worker.postMessage).not.toHaveBeenCalled();
  });

  it("posts a single reaction action's previews to the worker and forwards the action", () => {
    const { invoke, next, worker } = setup();
    const previews = { r1: 'svgA' };
    const action = getReactionActions.success({ previews } as unknown as Parameters<
      typeof getReactionActions.success
    >[0]);
    invoke(action as unknown as UnknownAction);
    expect(worker.postMessage).toHaveBeenCalledWith(previews);
    expect(next).toHaveBeenCalledWith(action);
  });

  it('merges previews across items for a reactions-list action', () => {
    const { invoke, worker } = setup();
    const action = getReactionsListActions.success({
      items: [{ previews: { a: '1' } }, { previews: { b: '2' } }],
    } as unknown as Parameters<typeof getReactionsListActions.success>[0]);
    invoke(action as unknown as UnknownAction);
    expect(worker.postMessage).toHaveBeenCalledWith({ a: '1', b: '2' });
  });

  it('merges previews across items for a reaction-page action', () => {
    const { invoke, worker } = setup();
    const action = getReactionPageActions.success({
      items: [{ previews: { p: '9' } }],
    } as unknown as Parameters<typeof getReactionPageActions.success>[0]);
    invoke(action as unknown as UnknownAction);
    expect(worker.postMessage).toHaveBeenCalledWith({ p: '9' });
  });

  it('merges previews across templates for a get-all-templates action', () => {
    const { invoke, worker } = setup();
    const action = getAllTemplatesActions.success([
      { previews: { t1: 'x' } },
      { previews: { t2: 'y' } },
    ] as unknown as Parameters<typeof getAllTemplatesActions.success>[0]);
    invoke(action as unknown as UnknownAction);
    expect(worker.postMessage).toHaveBeenCalledWith({ t1: 'x', t2: 'y' });
  });

  it('does not post unrelated actions but still forwards them', () => {
    const { invoke, next, worker } = setup();
    const action = { type: 'something/unrelated' } as UnknownAction;
    invoke(action);
    expect(worker.postMessage).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(action);
  });

  it('dispatches setPreviewsByIds when the worker posts a result back', () => {
    const { dispatch, worker } = setup();
    const previews = { r1: 'rendered' };
    worker.onmessage?.({ data: previews });
    expect(dispatch).toHaveBeenCalledWith(setPreviewsByIds(previews));
  });
});
