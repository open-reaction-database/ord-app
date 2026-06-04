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
import { describe, it, expect, vi } from 'vitest';
import { useIsHidden } from './useIsHidden.ts';
import type {
  ReactionFormConditionalRendering,
  ReactionFormMethods,
} from 'features/reactions/ReactionEntities/reactionEntities.types.ts';

type Condition = ReactionFormConditionalRendering['condition'];
type WatchCallback = (payload: { value: unknown }) => void;

const condition = (isHiddenFor: unknown): Condition =>
  ({ name: 'fieldA', isHidden: (value: unknown) => value === isHiddenFor }) as unknown as Condition;

function formMethods(currentValue: unknown) {
  const watch = vi.fn();
  const methods = { getValues: () => ({ fieldA: currentValue }), watch } as unknown as ReactionFormMethods;
  return { methods, watch };
}

describe('useIsHidden', () => {
  it('returns false immediately when there is no condition', () => {
    const { methods } = formMethods('whatever');
    const { result } = renderHook(() => useIsHidden(undefined, methods));
    expect(result.current).toBe(false);
  });

  it('seeds the hidden state from the current field value and subscribes to changes', () => {
    const { methods, watch } = formMethods('HIDE');
    const { result } = renderHook(() => useIsHidden(condition('HIDE'), methods));
    expect(result.current).toBe(true);
    expect(watch).toHaveBeenCalledWith('fieldA', expect.any(Function));
  });

  it('seeds to visible when the current value is not the hidden value', () => {
    const { methods } = formMethods('SHOW');
    const { result } = renderHook(() => useIsHidden(condition('HIDE'), methods));
    expect(result.current).toBe(false);
  });

  it('updates the hidden state when the watched value changes', () => {
    const { methods, watch } = formMethods('SHOW');
    const { result } = renderHook(() => useIsHidden(condition('HIDE'), methods));
    expect(result.current).toBe(false);

    const onChange = watch.mock.calls[0][1] as WatchCallback;
    act(() => onChange({ value: 'HIDE' }));
    expect(result.current).toBe(true);
  });
});
