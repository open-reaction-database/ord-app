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
    expect(handleApiError(axiosErrorWith(404))).toEqual({
      errorCode: 404,
      errorMessage: 'Entity not found',
    });
  });

  it('shows a backend-provided message for a conflict', () => {
    expect(handleApiError(axiosErrorWith(409, { message: 'Already shared' }))).toEqual({
      errorCode: 409,
      errorMessage: 'Already shared',
    });
  });

  it("shows FastAPI's detail when it is a sentence", () => {
    const detail =
      'Parquet export requires a dataset description. Please add a description and try again.';
    expect(handleApiError(axiosErrorWith(422, { detail }))).toEqual({
      errorCode: 422,
      errorMessage: detail,
    });
  });

  it('prefers detail over message', () => {
    expect(
      handleApiError(axiosErrorWith(400, { detail: 'Data error.', message: 'Other' })),
    ).toEqual({ errorCode: 400, errorMessage: 'Data error.' });
  });

  it.each([403, 404, 500])(
    'keeps the generic message for %i, whose detail can be for developers',
    status => {
      const detail = "Reaction with {'dataset_id': 3, 'id': 5} not found";
      expect(handleApiError(axiosErrorWith(status, { detail })).errorMessage).toBe(
        { 403: 'Access denied', 404: 'Entity not found', 500: 'Unknown error' }[status],
      );
    },
  );

  it('falls back to the default for a list of validation errors', () => {
    const detail = [{ loc: ['query', 'file_format'], msg: 'Input should be json' }];
    expect(handleApiError(axiosErrorWith(422, { detail }))).toEqual({
      errorCode: 422,
      errorMessage: 'Unknown error',
    });
  });

  it('falls back past a blank detail', () => {
    expect(handleApiError(axiosErrorWith(422, { detail: '  ' }))).toEqual({
      errorCode: 422,
      errorMessage: 'Unknown error',
    });
  });

  it('falls back to the default for a body that is not JSON', () => {
    expect(handleApiError(axiosErrorWith(422, new Blob(['{"detail": "x"}'])))).toEqual({
      errorCode: 422,
      errorMessage: 'Unknown error',
    });
  });

  it('falls back to the 500 message for an unmapped status', () => {
    expect(handleApiError(axiosErrorWith(418))).toEqual({
      errorCode: 418,
      errorMessage: 'Unknown error',
    });
  });

  it('returns a 500 RejectValue for non-axios errors', () => {
    expect(handleApiError(new Error('boom'))).toEqual({
      errorCode: 500,
      errorMessage: 'Unknown error',
    });
  });
});
