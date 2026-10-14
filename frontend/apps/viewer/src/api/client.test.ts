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
import { ApiError, errorMessage, getJson, isNotFound, postJson } from '#api/client.ts';

function respond(status: number, body: unknown, statusText = 'Status') {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response(text, { status, statusText }));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getJson', () => {
  it('sends the parameters and returns the body', async () => {
    const fetch = respond(200, [{ name: 'one' }]);
    const params = new URLSearchParams([
      ['id', 'b'],
      ['id', 'a'],
    ]);
    await expect(getJson('/api/reactions', params)).resolves.toEqual([{ name: 'one' }]);
    expect(fetch).toHaveBeenCalledWith('/api/reactions?id=b&id=a', expect.anything());
  });

  it('throws an ApiError carrying a message detail', async () => {
    respond(422, { detail: 'unknown path inputs.nope' });
    await expect(getJson('/api/search')).rejects.toMatchObject({
      status: 422,
      detail: 'unknown path inputs.nope',
      fromBackend: true,
    });
  });

  it('joins the messages of a list of validation errors', async () => {
    respond(422, {
      detail: [
        { type: 'missing', loc: ['body', 'query'], msg: 'Field required' },
        {
          type: 'extra_forbidden',
          loc: ['body', 'q'],
          msg: 'Extra inputs are not permitted',
        },
      ],
    });
    await expect(postJson('/api/search', {})).rejects.toMatchObject({
      status: 422,
      detail: 'Field required; Extra inputs are not permitted',
    });
  });

  it.each([
    ['no detail, not the backend’s', { error: 'x' }, false],
    ['a list of errors without messages', { detail: [{ type: 'missing' }] }, true],
    ['a detail that is neither a message nor a list', { detail: { code: 1 } }, true],
  ])('falls back to the status text for JSON with %s', async (_, body, fromBackend) => {
    respond(500, body, 'Internal Server Error');
    await expect(getJson('/api/datasets')).rejects.toMatchObject({
      status: 500,
      detail: 'Internal Server Error',
      fromBackend,
    });
  });

  it('falls back to the status text for a body that is not JSON, not the backend’s', async () => {
    respond(502, '<html>Bad Gateway</html>', 'Bad Gateway');
    await expect(getJson('/api/datasets')).rejects.toMatchObject({
      status: 502,
      detail: 'Bad Gateway',
      fromBackend: false,
    });
  });
});

describe('postJson', () => {
  it('sends the body as JSON', async () => {
    const fetch = respond(200, {
      kind: 'reactions',
      reaction_ids: [],
      truncated: false,
    });
    await postJson('/api/search', { query: { limit: 5 } });
    expect(fetch).toHaveBeenCalledWith(
      '/api/search',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"query":{"limit":5}}',
      }),
    );
  });
});

describe('errorMessage', () => {
  it.each([
    [404, 'x', 'Not found.'],
    [422, 'unknown compound "frobnicate"', 'unknown compound "frobnicate"'],
    [429, 'x', 'Too many questions; try again in a minute.'],
    [502, 'x', 'The question could not be turned into a search.'],
    [503, 'x', 'The service is busy or unavailable; try again shortly.'],
    [504, 'x', 'The search took too long; narrow it and try again.'],
    [500, 'Internal Server Error', 'The server answered 500: Internal Server Error'],
  ])('explains a %i', (status, detail, message) => {
    expect(errorMessage(new ApiError(status, detail))).toBe(message);
  });

  // nginx answers 502 while the backend starts or is down, and 504 when it does not answer
  // in time, each with its own HTML page rather than FastAPI's JSON.
  it.each([
    [502, 'Bad Gateway'],
    [504, 'Gateway Time-out'],
  ])(
    'explains a %i from the proxy as an unavailable service',
    async (status, statusText) => {
      respond(status, `<html>${statusText}</html>`, statusText);
      const error: unknown = await getJson('/api/datasets').catch(
        (caught: unknown) => caught,
      );
      expect(errorMessage(error)).toBe(
        'The service is busy or unavailable; try again shortly.',
      );
    },
  );

  it.each([
    [502, 'The question could not be turned into a search.'],
    [504, 'The search took too long; narrow it and try again.'],
  ])(
    'explains a %i from the backend as the backend means it',
    async (status, message) => {
      respond(status, { detail: 'x' });
      const error: unknown = await postJson('/api/ask', {}).catch(
        (caught: unknown) => caught,
      );
      expect(errorMessage(error)).toBe(message);
    },
  );

  it('explains a request that never reached the server', () => {
    expect(errorMessage(new TypeError('Failed to fetch'))).toBe(
      'The viewer could not reach its server.',
    );
  });
});

describe('isNotFound', () => {
  it.each([
    [new ApiError(404, 'Not Found'), true],
    [new ApiError(422, 'x'), false],
    [new TypeError('Failed to fetch'), false],
    [null, false],
  ])('says whether %o is a 404', (error, expected) => {
    expect(isNotFound(error)).toBe(expected);
  });
});
