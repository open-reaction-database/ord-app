/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFileNameHref } from './useFileNameHref.ts';

describe('useFileNameHref', () => {
  it('joins the name with the dot-stripped format and builds a base64 data href', () => {
    const { result } = renderHook(() =>
      useFileNameHref('molecule', { format: '.pb', value: 'YWJj' }),
    );
    expect(result.current.fileName).toBe('molecule.pb');
    expect(result.current.href).toBe('data:application/octet-stream;base64,YWJj');
  });

  it('omits the extension (no trailing dot) and empties the href when there is no file value', () => {
    const { result } = renderHook(() => useFileNameHref('molecule', null));
    expect(result.current.fileName).toBe('molecule');
    expect(result.current.href).toBe('data:application/octet-stream;base64,');
  });
});
