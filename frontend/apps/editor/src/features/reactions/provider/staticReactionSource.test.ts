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
import { emptyReactionData } from 'test/renderInReactionView.tsx';
import type { ReactionSnapshot } from './reactionProvider.types.ts';
import { createStaticReactionSource } from './staticReactionSource.ts';

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
