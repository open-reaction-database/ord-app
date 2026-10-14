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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSelection } from '#search/selection.ts';

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('useSelection', () => {
  it('selects and unselects, in the order chosen', () => {
    const { result } = renderHook(() => useSelection('limit=100'));
    act(() => result.current.toggle('b'));
    act(() => result.current.toggle('a'));
    expect(result.current.selected).toEqual(['b', 'a']);
    act(() => result.current.toggle('b'));
    expect(result.current.selected).toEqual(['a']);
    expect(result.current.isSelected('a')).toBe(true);
  });

  it('keeps the selection for its key across mounts', () => {
    const first = renderHook(() => useSelection('limit=100'));
    act(() => first.result.current.toggle('a'));
    first.unmount();
    expect(renderHook(() => useSelection('limit=100')).result.current.selected).toEqual(
      ['a'],
    );
    expect(renderHook(() => useSelection('limit=5')).result.current.selected).toEqual(
      [],
    );
  });

  it('reads the selection of a new key on the next render', () => {
    const { result, rerender } = renderHook(({ key }) => useSelection(key), {
      initialProps: { key: 'limit=100' },
    });
    act(() => result.current.toggle('a'));
    rerender({ key: 'limit=5' });
    expect(result.current.selected).toEqual([]);
    act(() => result.current.toggle('b'));
    rerender({ key: 'limit=100' });
    expect(result.current.selected).toEqual(['a']);
  });

  it('stops at 100', () => {
    const { result } = renderHook(() => useSelection('k'));
    for (let index = 0; index < 100; index += 1) {
      act(() => result.current.toggle(`ord-${index}`));
    }
    expect(result.current.canSelect('ord-100')).toBe(false);
    expect(result.current.canSelect('ord-1')).toBe(true);
    act(() => result.current.toggle('ord-100'));
    expect(result.current.selected).toHaveLength(100);
  });

  it('works without storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { result } = renderHook(() => useSelection('k'));
    act(() => result.current.toggle('a'));
    expect(result.current.selected).toEqual(['a']);
  });

  it('clears', () => {
    const { result } = renderHook(() => useSelection('k'));
    act(() => result.current.toggle('a'));
    act(() => result.current.clear());
    expect(result.current.selected).toEqual([]);
  });
});
