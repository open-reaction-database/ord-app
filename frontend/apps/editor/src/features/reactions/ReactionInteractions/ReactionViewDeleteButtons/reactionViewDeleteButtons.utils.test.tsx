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
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { MouseEvent, ReactNode } from 'react';
import { ReactionProvider } from 'features/reactions/provider/ReactionProvider.tsx';
import { useDrawerStack } from 'features/reactions/provider/reactionProvider.hooks.ts';
import { createStaticReactionSource } from 'features/reactions/provider/staticReactionSource.ts';
import { emptyReactionData } from 'test/renderInReactionView.tsx';
import type { ReactionViewDeleteButtonsProps } from './reactionViewDeleteButtons.types.ts';
import {
  onViewDeleteButtonsWrapperClick,
  useOnViewEdit,
} from './reactionViewDeleteButtons.utils.ts';

const Empty = () => null;
const source = createStaticReactionSource({
  data: emptyReactionData(),
  previews: {},
  summary: { provenance: {}, summary: {}, conditions: '' },
});

function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ReactionProvider
      reactionId={1}
      source={source}
      slots={{ ViewDeleteButtons: Empty, ValueLabel: Empty, ViewOnlyLabel: Empty }}
    >
      {children}
    </ReactionProvider>
  );
}

function openWith(props: Omit<ReactionViewDeleteButtonsProps, 'entityName'>) {
  const { result } = renderHook(
    () => ({ open: useOnViewEdit(props), stack: useDrawerStack() }),
    { wrapper: Wrapper },
  );
  act(() => result.current.open());
  return result.current.stack;
}

describe('onViewDeleteButtonsWrapperClick', () => {
  it('stops event propagation', () => {
    const stopPropagation = vi.fn();
    onViewDeleteButtonsWrapperClick({ stopPropagation } as unknown as MouseEvent);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });
});

describe('useOnViewEdit', () => {
  it('appends the path to the stack when there is no history', () => {
    expect(openWith({ pathComponents: ['inputs', 0] })).toEqual([['inputs', 0]]);
  });

  it('replaces the stack with the history plus the current path', () => {
    expect(
      openWith({
        pathComponents: ['inputs', 0],
        historyPathComponents: [['setup'], ['conditions']],
      }),
    ).toEqual([['setup'], ['conditions'], ['inputs', 0]]);
  });
});
