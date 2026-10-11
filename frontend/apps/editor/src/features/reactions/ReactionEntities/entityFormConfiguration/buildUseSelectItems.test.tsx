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
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import type { ReactionPathComponents } from '@open-reaction-database/ui/reaction/model';
import {
  reactionEntityContext,
  type ReactionSnapshot,
} from '@open-reaction-database/ui/reaction';
import { reactionWrapper, emptyReactionData } from '@open-reaction-database/ui/testing';
import {
  buildUseSelectItems,
  buildUseSelectItemsListFromMap,
} from './buildUseSelectItems.ts';

/** Renders under a static reaction holding `data`, with the entity context at `pathComponents`. */
function wrapperAt(
  pathComponents: ReactionPathComponents,
  data: Record<string, unknown>,
) {
  const ReactionWrapper = reactionWrapper({
    snapshot: {
      data: { ...emptyReactionData(), ...data },
      previews: {},
      summary: { provenance: {}, summary: {}, conditions: '' },
    } as ReactionSnapshot,
  });
  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <ReactionWrapper>
        <reactionEntityContext.Provider value={{ pathComponents }}>
          {children}
        </reactionEntityContext.Provider>
      </ReactionWrapper>
    );
  };
}

describe('buildUseSelectItems', () => {
  it('selects a string entityPath under the context path', () => {
    const { result } = renderHook(buildUseSelectItems('amount'), {
      wrapper: wrapperAt(['inputs', 0], { inputs: [{ amount: 'value-x' }] }),
    });
    expect(result.current).toBe('value-x');
  });

  it('appends an array entityPath verbatim to the context path', () => {
    const { result } = renderHook(buildUseSelectItems(['conditions', 'temperature']), {
      wrapper: wrapperAt(['setup'], {
        setup: { conditions: { temperature: { some: 'object' } } },
      }),
    });
    expect(result.current).toEqual({ some: 'object' });
  });

  it('returns an empty list when the path does not exist', () => {
    const { result } = renderHook(buildUseSelectItems('components'), {
      wrapper: wrapperAt(['inputs', 'missing'], {}),
    });
    expect(result.current).toEqual([]);
  });
});

interface OrderedItem {
  id: string;
  order: number;
}

describe('buildUseSelectItemsListFromMap', () => {
  const byOrder = (a: OrderedItem, b: OrderedItem) => a.order - b.order;
  const useComponents = buildUseSelectItemsListFromMap<OrderedItem>(
    'components',
    byOrder,
  );

  it('returns the values of the map under the context path, sorted', () => {
    const { result } = renderHook(useComponents, {
      wrapper: wrapperAt(['inputs'], {
        inputs: { components: { x: { id: 'x', order: 2 }, y: { id: 'y', order: 1 } } },
      }),
    });
    expect(result.current).toEqual([
      { id: 'y', order: 1 },
      { id: 'x', order: 2 },
    ]);
  });

  it('keeps the sorted list while the map is unchanged', () => {
    const { result, rerender } = renderHook(useComponents, {
      wrapper: wrapperAt(['inputs'], {
        inputs: { components: { a: { id: 'a', order: 1 } } },
      }),
    });
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('returns an empty list when the map does not exist', () => {
    const { result } = renderHook(useComponents, {
      wrapper: wrapperAt(['inputs'], {}),
    });
    expect(result.current).toEqual([]);
  });
});
