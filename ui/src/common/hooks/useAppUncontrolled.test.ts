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
import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent } from 'react';
import { useAppUncontrolled } from 'common/hooks/useAppUncontrolled.ts';

describe('useAppUncontrolled', () => {
  it('is controlled when value is provided', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useAppUncontrolled<string>({ value: 'controlled', onChange }));
    const [value, , isControlled] = result.current;
    expect(value).toBe('controlled');
    expect(isControlled).toBe(true);
  });

  it('falls back to defaultValue, then finalValue, when uncontrolled', () => {
    const fromDefault = renderHook(() => useAppUncontrolled<string>({ defaultValue: 'd', finalValue: 'f' }));
    expect(fromDefault.result.current[0]).toBe('d');
    expect(fromDefault.result.current[2]).toBe(false);

    const fromFinal = renderHook(() => useAppUncontrolled<string>({ finalValue: 'f' }));
    expect(fromFinal.result.current[0]).toBe('f');
  });

  it('updates the uncontrolled value and calls onChange for a raw value', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useAppUncontrolled<string>({ defaultValue: 'a', onChange }));
    act(() => result.current[1]('b'));
    expect(result.current[0]).toBe('b');
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('reads value from a ChangeEvent target', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useAppUncontrolled<string>({ defaultValue: 'a', onChange }));
    const setValue = result.current[1] as unknown as (event: ChangeEvent<HTMLInputElement>) => void;
    act(() => setValue({ target: { value: 'from-event' } } as ChangeEvent<HTMLInputElement>));
    expect(result.current[0]).toBe('from-event');
    expect(onChange).toHaveBeenCalledWith('from-event');
  });
});
