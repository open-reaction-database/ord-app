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
import { useContext, type ReactNode } from 'react';
import { reactionContext } from 'features/reactions/reactions.context.ts';
import type { ReactionInput } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import { emptyReactionData } from 'test/renderInReactionView.tsx';
import { ReactionProvider } from './ReactionProvider.tsx';
import {
  useIsViewOnly,
  useOrderedInputs,
  usePreviews,
  useReactionActions,
  useReactionPart,
  useReactionSnapshot,
} from './reactionProvider.hooks.ts';
import type {
  ReactionActions,
  ReactionSlots,
  ReactionSnapshot,
  ReactionSource,
} from './reactionProvider.types.ts';
import { createStaticReactionSource } from './staticReactionSource.ts';

const Empty = () => null;
const slots: ReactionSlots = {
  ViewDeleteButtons: Empty,
  ValueLabel: Empty,
  ViewOnlyLabel: Empty,
};

const input = (name: string, additionOrder: number) =>
  ({ name, additionOrder }) as unknown as ReactionInput;

const snapshot = {
  data: {
    ...emptyReactionData(),
    inputs: { second: input('second', 2), first: input('first', 1) },
  },
  previews: {},
  summary: { provenance: {}, summary: {}, conditions: '' },
} as ReactionSnapshot;

function wrapperFor(source: ReactionSource, actions?: ReactionActions) {
  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <ReactionProvider
        reactionId={7}
        source={source}
        actions={actions}
        slots={slots}
      >
        {children}
      </ReactionProvider>
    );
  };
}

describe('reaction hooks over a static source', () => {
  const source = createStaticReactionSource(snapshot, {
    a: { isLoading: false, svg: 'A' },
    b: { isLoading: true, svg: null },
  });
  const wrapper = wrapperFor(source);

  it('return the snapshot and parts of it by path', () => {
    expect(renderHook(useReactionSnapshot, { wrapper }).result.current).toBe(snapshot);
    const { result } = renderHook(() => useReactionPart(['inputs', 'first']), {
      wrapper,
    });
    expect(result.current).toBe(snapshot.data.inputs.first);
  });

  it('return null for a path that does not exist', () => {
    const { result } = renderHook(
      () => useReactionPart(['inputs', 'missing', 'name']),
      {
        wrapper,
      },
    );
    expect(result.current).toBeNull();
  });

  it('order inputs', () => {
    const { result } = renderHook(useOrderedInputs, { wrapper });
    expect(result.current.map(item => item.name)).toEqual(['first', 'second']);
  });

  it('pick previews by ID, keeping unknown IDs as undefined', () => {
    const { result } = renderHook(() => usePreviews(['a', 'zzz']), { wrapper });
    expect(result.current).toEqual({
      a: { isLoading: false, svg: 'A' },
      zzz: undefined,
    });
  });

  it('are read-only without actions, and supply the old context as view-only', () => {
    expect(renderHook(useIsViewOnly, { wrapper }).result.current).toBe(true);
    expect(renderHook(useReactionActions, { wrapper }).result.current).toBeUndefined();
    const legacy = renderHook(() => useContext(reactionContext), { wrapper }).result
      .current;
    expect(legacy).toMatchObject({
      reactionId: 7,
      isTemplate: false,
      isViewOnly: true,
    });
    expect(legacy.ViewDeleteButtonsComponent).toBe(Empty);
  });

  it('are editable with actions', () => {
    const actions: ReactionActions = { update: vi.fn(), remove: vi.fn() };
    const editable = wrapperFor(source, actions);
    expect(renderHook(useIsViewOnly, { wrapper: editable }).result.current).toBe(false);
    expect(renderHook(useReactionActions, { wrapper: editable }).result.current).toBe(
      actions,
    );
    const legacy = renderHook(() => useContext(reactionContext), { wrapper: editable });
    expect(legacy.result.current.isViewOnly).toBe(false);
  });
});

describe('reaction hooks before the reaction loads', () => {
  const wrapper = wrapperFor(createStaticReactionSource(undefined));

  it('return empty values instead of throwing', () => {
    expect(renderHook(useReactionSnapshot, { wrapper }).result.current).toBeUndefined();
    expect(
      renderHook(() => useReactionPart(['notes']), { wrapper }).result.current,
    ).toBeNull();
    expect(renderHook(useOrderedInputs, { wrapper }).result.current).toEqual([]);
    expect(renderHook(() => usePreviews([]), { wrapper }).result.current).toEqual({});
  });
});

describe('reaction hooks outside a provider', () => {
  it('throw a message naming the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(useReactionSnapshot)).toThrow(/ReactionProvider/);
  });
});
