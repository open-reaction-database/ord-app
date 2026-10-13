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
import { describe, expect, it } from 'vitest';
import { ApiError } from '#api/client.ts';
import { shouldRetry } from '#api/queryClient.ts';

describe('shouldRetry', () => {
  it('retries a request that never reached the server, once', () => {
    expect(shouldRetry(0, new TypeError('Failed to fetch'))).toBe(true);
    expect(shouldRetry(1, new TypeError('Failed to fetch'))).toBe(false);
  });

  it('never retries a request the server answered', () => {
    expect(shouldRetry(0, new ApiError(503, 'busy'))).toBe(false);
  });

  it('never retries a request refused before it was sent', () => {
    expect(shouldRetry(0, new RangeError('too many'))).toBe(false);
  });
});
