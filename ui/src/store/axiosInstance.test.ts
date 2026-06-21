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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleResponseError, setPermissionDeniedHandler } from './axiosInstance.ts';

function axiosError(status: number) {
  // Minimal shape that axios.isAxiosError() recognizes (checks `isAxiosError === true`).
  return { isAxiosError: true, response: { status } } as unknown;
}

describe('handleResponseError', () => {
  let handler: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    handler = vi.fn();
    setPermissionDeniedHandler(handler);
  });

  it('invokes the permission-denied handler on a 403 and re-rejects the same error (#617)', async () => {
    const error = axiosError(403);
    await expect(handleResponseError(error)).rejects.toBe(error);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it.each([401, 404, 409, 500])(
    're-rejects without re-gating on a %i',
    async status => {
      const error = axiosError(status);
      await expect(handleResponseError(error)).rejects.toBe(error);
      expect(handler).not.toHaveBeenCalled();
    },
  );

  it('does not re-gate for a non-axios error (e.g. a network failure with no response)', async () => {
    const error = new Error('network down');
    await expect(handleResponseError(error)).rejects.toBe(error);
    expect(handler).not.toHaveBeenCalled();
  });
});
