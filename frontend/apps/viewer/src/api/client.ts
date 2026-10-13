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
/** A response outside 2xx, with the server's explanation of it. */
export class ApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(`${status}: ${detail}`);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

/** Reads FastAPI's error body: a message, a list of validation errors, or neither. */
async function readDetail(response: Response): Promise<string> {
  try {
    const { detail } = (await response.json()) as { detail?: unknown };
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      const messages = detail
        .map(item => (item as { msg?: unknown }).msg)
        .filter((message): message is string => typeof message === 'string');
      if (messages.length > 0) {
        return messages.join('; ');
      }
    }
  } catch {
    // Not JSON, such as nginx's own error page.
  }
  return response.statusText;
}

/** Fetches path, throwing ApiError for a response outside 2xx. */
export async function send(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(path, init);
  if (!response.ok) {
    throw new ApiError(response.status, await readDetail(response));
  }
  return response;
}

export async function getJson<T>(
  path: string,
  params?: URLSearchParams,
  signal?: AbortSignal,
): Promise<T> {
  const url = params ? `${path}?${params}` : path;
  return (await (await send(url, { signal })).json()) as T;
}

export async function postJson<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await send(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  return (await response.json()) as T;
}

const MESSAGES: Record<number, string> = {
  404: 'Not found.',
  429: 'Too many questions; try again in a minute.',
  502: 'The question could not be turned into a search.',
  503: 'The service is busy or unavailable; try again shortly.',
  504: 'The search took too long; narrow it and try again.',
};

/** What to tell the user about a failed request. */
export function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'The viewer could not reach its server.';
  }
  if (error.status === 422) {
    return error.detail;
  }
  return (
    MESSAGES[error.status] ?? `The server answered ${error.status}: ${error.detail}`
  );
}
