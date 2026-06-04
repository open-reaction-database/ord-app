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
import type { MouseEvent } from 'react';

const dispatch = vi.hoisted(() => vi.fn());
vi.mock('store/useAppDispatch.ts', () => ({ useAppDispatch: () => dispatch }));
vi.mock('store/features/reactionForm/reactionForm.actions.ts', () => ({
  addReactionPathComponentToList: (path: unknown) => ({ type: 'addReactionPathComponentToList', payload: path }),
  setReactionPathComponentsList: (list: unknown) => ({ type: 'setReactionPathComponentsList', payload: list }),
}));

import { onViewDeleteButtonsWrapperClick, useOnViewEdit } from './reactionViewDeleteButtons.utils.ts';

afterEach(() => {
  dispatch.mockClear();
});

describe('onViewDeleteButtonsWrapperClick', () => {
  it('stops event propagation', () => {
    const stopPropagation = vi.fn();
    onViewDeleteButtonsWrapperClick({ stopPropagation } as unknown as MouseEvent);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });
});

describe('useOnViewEdit', () => {
  it('appends the path to the list when there is no history', () => {
    const { result } = renderHook(() => useOnViewEdit({ pathComponents: ['inputs', 0] }));
    result.current();
    expect(dispatch).toHaveBeenCalledWith({ type: 'addReactionPathComponentToList', payload: ['inputs', 0] });
  });

  it('replaces the list with history plus the current path when history is provided', () => {
    const { result } = renderHook(() =>
      useOnViewEdit({ pathComponents: ['inputs', 0], historyPathComponents: [['setup'], ['conditions']] }),
    );
    result.current();
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setReactionPathComponentsList',
      payload: [['setup'], ['conditions'], ['inputs', 0]],
    });
  });
});
