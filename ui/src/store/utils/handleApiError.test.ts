/*
 * Copyright 2024 Open Reaction Database Project Authors
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
import { describe, it, expect } from 'vitest';
import { AxiosError, type AxiosResponse } from 'axios';
import { handleApiError } from './handleApiError.ts';

const axiosErrorWith = (status: number, data: unknown = {}): AxiosError =>
  new AxiosError('request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    data,
  } as AxiosResponse);

describe('handleApiError', () => {
  it('maps a known HTTP status to its default message', () => {
    expect(handleApiError(axiosErrorWith(404))).toEqual({ errorCode: 404, errorMessage: 'Entity not found' });
  });

  it('prefers a backend-provided message over the default', () => {
    expect(handleApiError(axiosErrorWith(403, { message: 'Custom denied' }))).toEqual({
      errorCode: 403,
      errorMessage: 'Custom denied',
    });
  });

  it('falls back to the 500 message for an unmapped status', () => {
    expect(handleApiError(axiosErrorWith(418))).toEqual({ errorCode: 418, errorMessage: 'Unknown error' });
  });

  it('returns a 500 RejectValue for non-axios errors', () => {
    expect(handleApiError(new Error('boom'))).toEqual({ errorCode: 500, errorMessage: 'Unknown error' });
  });
});
