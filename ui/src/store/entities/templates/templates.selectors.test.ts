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
import { selectAreTemplatesLoaded, selectTemplates, selectTemplatesOrder } from './templates.selectors.ts';
import type { ReactionTemplate } from 'store/entities/reactions/reactions.types.ts';
import type { AppState } from '../../configureAppStore.ts';

const makeTemplate = (id: string): ReactionTemplate => ({ id, name: `template-${id}` }) as ReactionTemplate;

const buildState = (templatesOrder: Array<string>, reactionsById: Record<string, ReactionTemplate>): AppState =>
  ({
    entities: {
      templates: { templatesOrder },
      reactions: { reactionsById },
    },
  }) as unknown as AppState;

describe('selectTemplatesOrder', () => {
  it('returns the stored order', () => {
    expect(selectTemplatesOrder(buildState(['a', 'b'], {}))).toEqual(['a', 'b']);
  });
});

describe('selectAreTemplatesLoaded', () => {
  it('reflects the templates-loaded flag (#496)', () => {
    const state = (loaded: boolean) =>
      ({ entities: { templates: { areTemplatesLoaded: loaded } } }) as unknown as AppState;
    expect(selectAreTemplatesLoaded(state(false))).toBe(false);
    expect(selectAreTemplatesLoaded(state(true))).toBe(true);
  });
});

describe('selectTemplates', () => {
  it('resolves the ordered ids against the reactions store', () => {
    const a = makeTemplate('a');
    const b = makeTemplate('b');
    const state = buildState(['b', 'a'], { a, b });
    expect(selectTemplates(state)).toEqual([b, a]);
  });

  it('returns an empty list when there is no order', () => {
    expect(selectTemplates(buildState([], { a: makeTemplate('a') }))).toEqual([]);
  });

  // An id can be in templatesOrder before its reaction data has loaded (getAllTemplates
  // populates the order, individual reaction data arrives separately). The selector does
  // an unguarded lookup, so it yields undefined for the missing entry — pin that behavior.
  it('yields undefined for an ordered id that is not yet in the reactions store', () => {
    const a = makeTemplate('a');
    const result = selectTemplates(buildState(['a', 'missing'], { a }));
    expect(result).toEqual([a, undefined]);
  });
});
