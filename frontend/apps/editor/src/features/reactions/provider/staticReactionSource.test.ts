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
import { emptyReactionData } from 'test/emptyReactionData.ts';
import type { ReactionSnapshot } from './reactionProvider.types.ts';
import { createStaticReactionSource } from './staticReactionSource.ts';

const { renderPreviewsMock } = vi.hoisted(() => ({ renderPreviewsMock: vi.fn() }));
vi.mock('@open-reaction-database/ui/reaction/previews', () => ({
  renderPreviews: renderPreviewsMock,
}));

const snapshot = {
  data: emptyReactionData(),
  previews: {},
  summary: { provenance: {}, summary: {}, conditions: '' },
  pb_reaction_id: 'ord-0123',
} as ReactionSnapshot;

describe('createStaticReactionSource', () => {
  it('returns the same snapshot and previews on every call', () => {
    const previews = { a: { isLoading: false, svg: 'PHN2Zz4=' } };
    const source = createStaticReactionSource(snapshot, previews);
    expect(source.getSnapshot()).toBe(snapshot);
    expect(source.getSnapshot()).toBe(source.getSnapshot());
    expect(source.getPreviews()).toBe(previews);
  });

  it('defaults to no previews', () => {
    const source = createStaticReactionSource(snapshot);
    expect(source.getPreviews()).toBe(source.getPreviews());
    expect(source.getPreviews()).toEqual({});
  });

  it('can stand for a reaction that has not loaded', () => {
    expect(createStaticReactionSource(undefined).getSnapshot()).toBeUndefined();
  });

  it('never notifies, and unsubscribes cleanly', () => {
    const listener = vi.fn();
    const unsubscribe = createStaticReactionSource(snapshot).subscribe(listener);
    unsubscribe();
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('a static source without given previews', () => {
  const withMolblocks = {
    ...snapshot,
    previews: { a: 'MOL A', b: null },
  } as ReactionSnapshot;

  it('starts with previews loading, renders them on first subscription, and notifies', async () => {
    renderPreviewsMock.mockResolvedValue({ a: 'SVG A', b: null });
    const source = createStaticReactionSource(withMolblocks);
    const before = source.getPreviews();
    expect(before).toEqual({
      a: { isLoading: true, svg: null },
      b: { isLoading: false, svg: null },
    });
    expect(source.getPreviews()).toBe(before);
    expect(renderPreviewsMock).not.toHaveBeenCalled();

    const listener = vi.fn();
    source.subscribe(listener);
    source.subscribe(vi.fn());
    expect(renderPreviewsMock).toHaveBeenCalledTimes(1);
    expect(renderPreviewsMock).toHaveBeenCalledWith({ a: 'MOL A', b: null });
    await vi.waitFor(() => expect(listener).toHaveBeenCalledTimes(1));
    const after = source.getPreviews();
    expect(after).toEqual({
      a: { isLoading: false, svg: 'SVG A' },
      b: { isLoading: false, svg: null },
    });
    expect(source.getPreviews()).toBe(after);
  });

  it('stops loading when the render fails', async () => {
    renderPreviewsMock.mockRejectedValue(new Error('no wasm'));
    const source = createStaticReactionSource(withMolblocks);
    const listener = vi.fn();
    source.subscribe(listener);
    await vi.waitFor(() => expect(listener).toHaveBeenCalled());
    expect(source.getPreviews()).toEqual({
      a: { isLoading: false, svg: null },
      b: { isLoading: false, svg: null },
    });
  });

  it('stops notifying after unsubscribing', async () => {
    renderPreviewsMock.mockResolvedValue({ a: 'SVG A', b: null });
    const source = createStaticReactionSource(withMolblocks);
    const listener = vi.fn();
    source.subscribe(listener)();
    await vi.waitFor(() => expect(source.getPreviews().a.svg).toBe('SVG A'));
    expect(listener).not.toHaveBeenCalled();
  });

  it('renders nothing when no molblock needs rendering', () => {
    const source = createStaticReactionSource({ ...snapshot, previews: { b: null } });
    const before = source.getPreviews();
    source.subscribe(vi.fn());
    expect(renderPreviewsMock).not.toHaveBeenCalled();
    expect(source.getPreviews()).toBe(before);
    expect(before).toEqual({ b: { isLoading: false, svg: null } });
  });
});
