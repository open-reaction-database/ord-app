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
import type { MiddlewareAPI } from '@reduxjs/toolkit';
import { describe, expect, it, vi } from 'vitest';
import { previewsWorkerMiddleware } from './previewsWorkerMiddleware.ts';
import {
  addUpdateReactionFieldActions,
  getReactionActions,
  getReactionPageActions,
  getReactionsListActions,
} from 'store/entities/reactions/reactions.actions.ts';
import { getAllTemplatesActions } from 'store/entities/templates/templates.actions.ts';
import { setPreviewsByIds } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.actions.ts';

const { renderPreviewsMock } = vi.hoisted(() => ({
  renderPreviewsMock: vi.fn(() => Promise.resolve({})),
}));
vi.mock('@open-reaction-database/ui/reaction/previews', () => ({
  renderPreviews: renderPreviewsMock,
}));

function run(action: unknown) {
  const dispatch = vi.fn();
  const next = vi.fn((passed: unknown) => passed);
  const api = { dispatch, getState: vi.fn() } as unknown as MiddlewareAPI;
  (previewsWorkerMiddleware(api)(next) as (action: unknown) => unknown)(action);
  return { dispatch, next };
}

// The middleware matches by action.type and only reads payload.previews /
// payload.items, so plain {type, payload} literals exercise it faithfully
// without fabricating full DatasetReaction/Pages payloads.
const action = (type: string, payload: unknown) => ({ type, payload });

describe('previewsWorkerMiddleware', () => {
  it('passes thunk (function) actions straight through without rendering', () => {
    const thunk = () => undefined;
    const { next } = run(thunk);
    expect(next).toHaveBeenCalledWith(thunk);
    expect(renderPreviewsMock).not.toHaveBeenCalled();
  });

  it('does not render for unrelated actions but still forwards them', () => {
    const unrelated = { type: 'unrelated/action' };
    const { next } = run(unrelated);
    expect(renderPreviewsMock).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(unrelated);
  });

  it("renders a single reaction action's previews and forwards the action", () => {
    const previews = { r1: 'svgA' };
    const single = action(getReactionActions.success.type, { previews });
    const { next } = run(single);
    expect(renderPreviewsMock).toHaveBeenCalledWith(previews);
    expect(next).toHaveBeenCalledWith(single);
  });

  it('merges previews across items for a reactions-list action', () => {
    run(
      action(getReactionsListActions.success.type, {
        items: [{ previews: { a: '1' } }, { previews: { b: '2' } }],
      }),
    );
    expect(renderPreviewsMock).toHaveBeenCalledWith({ a: '1', b: '2' });
  });

  it('merges previews across items for a reaction-page action', () => {
    run(
      action(getReactionPageActions.success.type, {
        items: [{ previews: { p: '9' } }],
      }),
    );
    expect(renderPreviewsMock).toHaveBeenCalledWith({ p: '9' });
  });

  it('merges previews across templates for a get-all-templates action', () => {
    run(
      action(getAllTemplatesActions.success.type, [
        { previews: { t1: 'x' } },
        { previews: { t2: 'y' } },
      ]),
    );
    expect(renderPreviewsMock).toHaveBeenCalledWith({ t1: 'x', t2: 'y' });
  });

  it('dispatches setPreviewsByIds with the rendered SVGs', async () => {
    renderPreviewsMock.mockResolvedValue({ a: 'SVG' });
    const { dispatch } = run(
      action(getReactionActions.success.type, { previews: { a: 'MOL' } }),
    );
    await vi.waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith(setPreviewsByIds({ a: 'SVG' })),
    );
  });

  it('dispatches no preview for every requested key when the render fails', async () => {
    renderPreviewsMock.mockRejectedValue(new Error('no wasm'));
    const { dispatch } = run(
      action(getReactionActions.success.type, { previews: { a: 'MOL', b: null } }),
    );
    await vi.waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith(setPreviewsByIds({ a: null, b: null })),
    );
  });

  it('drops the keys of a render that a newer one has replaced', async () => {
    let finishFirst: ((svgsById: Record<string, string | null>) => void) | undefined;
    renderPreviewsMock
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            finishFirst = resolve;
          }),
      )
      .mockImplementationOnce(() => Promise.resolve({ a: null }));
    const dispatch = vi.fn();
    const api = { dispatch, getState: vi.fn() } as unknown as MiddlewareAPI;
    const handle = previewsWorkerMiddleware(api)(vi.fn()) as (
      action: unknown,
    ) => unknown;
    handle(
      action(getReactionActions.success.type, { previews: { a: 'MOL A', b: 'MOL B' } }),
    );
    // The user clears a's structure while the first render is still running.
    handle(
      action(addUpdateReactionFieldActions.success.type, { previews: { a: null } }),
    );
    await vi.waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith(setPreviewsByIds({ a: null })),
    );
    finishFirst?.({ a: 'OLD SVG', b: 'SVG B' });
    await vi.waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith(setPreviewsByIds({ b: 'SVG B' })),
    );
    expect(dispatch).not.toHaveBeenCalledWith(
      setPreviewsByIds({ a: 'OLD SVG', b: 'SVG B' }),
    );
  });
});
