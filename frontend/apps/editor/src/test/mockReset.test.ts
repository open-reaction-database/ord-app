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
import { describe, expect, it, vi } from 'vitest';

// The config's mockReset resets every mock before each test. These tests run in order:
// the first leaves state behind, and the second checks that none of it survived.
const mock = vi.fn((value: number) => value);

describe('mockReset', () => {
  it('leaves a call, an override, and an unused queued value behind', () => {
    mock(1);
    mock.mockImplementation(() => 0);
    mock.mockReturnValueOnce(99);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('starts the next test with the original implementation and no calls', () => {
    expect(mock(2)).toBe(2);
    expect(mock).toHaveBeenCalledTimes(1);
  });
});
