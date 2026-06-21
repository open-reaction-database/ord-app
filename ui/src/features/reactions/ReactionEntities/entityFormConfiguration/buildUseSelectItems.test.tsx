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
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import {
  buildUseSelectItems,
  buildUseSelectItemsListFromMap,
} from './buildUseSelectItems.ts';

// selectReactionPartByPath builds the parameterized selector; capture its args
// to assert the path the hook resolves, and drive the hook's return value
// through a useSelector mock that ignores the (mocked) selector identity.
const selectReactionPartByPathMock = vi.hoisted(() =>
  vi.fn((reactionId: number, path: unknown) => ({ reactionId, path })),
);
vi.mock('store/entities/reactions/reactions.selectors.ts', () => ({
  selectReactionPartByPath: selectReactionPartByPathMock,
}));

let selectorReturn: unknown;
vi.mock('react-redux', () => ({ useSelector: () => selectorReturn }));

function contextWrapper(reactionId: number, pathComponents: Array<string | number>) {
  const Wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
    <reactionEntityContext.Provider value={{ reactionId, pathComponents }}>
      {children}
    </reactionEntityContext.Provider>
  );
  Wrapper.displayName = 'ContextWrapper';
  return Wrapper;
}

afterEach(() => {
  vi.clearAllMocks();
  selectorReturn = undefined;
});

describe('buildUseSelectItems', () => {
  it('wraps a string entityPath into a single path segment appended to the context path', () => {
    selectorReturn = 'value-x';
    const { result } = renderHook(() => buildUseSelectItems('amount')(), {
      wrapper: contextWrapper(5, ['inputs', 0]),
    });
    expect(selectReactionPartByPathMock).toHaveBeenCalledWith(5, [
      'inputs',
      0,
      'amount',
    ]);
    expect(result.current).toBe('value-x');
  });

  it('appends an array entityPath verbatim to the context path', () => {
    selectorReturn = { some: 'object' };
    renderHook(() => buildUseSelectItems(['conditions', 'temperature'])(), {
      wrapper: contextWrapper(5, ['setup']),
    });
    expect(selectReactionPartByPathMock).toHaveBeenCalledWith(5, [
      'setup',
      'conditions',
      'temperature',
    ]);
  });
});

interface OrderedItem {
  id: string;
  order: number;
}

describe('buildUseSelectItemsListFromMap', () => {
  const byOrder = (a: OrderedItem, b: OrderedItem) => a.order - b.order;

  it('resolves the entity map under the context path and returns its values sorted', () => {
    selectorReturn = { x: { id: 'x', order: 2 }, y: { id: 'y', order: 1 } };
    const { result } = renderHook(
      () => buildUseSelectItemsListFromMap<OrderedItem>('components', byOrder)(),
      {
        wrapper: contextWrapper(5, ['inputs']),
      },
    );
    expect(selectReactionPartByPathMock).toHaveBeenCalledWith(5, [
      'inputs',
      'components',
    ]);
    expect(result.current).toEqual([
      { id: 'y', order: 1 },
      { id: 'x', order: 2 },
    ]);
  });

  it('memoizes the sorted list while the underlying map reference is unchanged', () => {
    selectorReturn = { a: { id: 'a', order: 1 } };
    const { result, rerender } = renderHook(
      () => buildUseSelectItemsListFromMap<OrderedItem>('components', byOrder)(),
      {
        wrapper: contextWrapper(5, ['inputs']),
      },
    );
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
