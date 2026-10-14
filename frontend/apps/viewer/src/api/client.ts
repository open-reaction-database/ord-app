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
  /** Whether the backend wrote the response, rather than nginx in front of it. */
  readonly fromBackend: boolean;

  constructor(status: number, detail: string, fromBackend = true) {
    super(`${status}: ${detail}`);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.fromBackend = fromBackend;
  }
}

/** FastAPI's detail as one message: itself, or its validation errors' messages joined. */
function detailMessage(detail: unknown): string | undefined {
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
  return undefined;
}

/**
 * Reads an error response into an ApiError.
 *
 * A body carrying FastAPI's detail is the backend's. Any other body, such as nginx's own
 * error page, is not, and the status text explains it, as it does a detail with no message.
 */
async function readError(response: Response): Promise<ApiError> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    // Not JSON.
  }
  if (typeof body !== 'object' || body === null || !('detail' in body)) {
    return new ApiError(response.status, response.statusText, false);
  }
  return new ApiError(
    response.status,
    detailMessage(body.detail) ?? response.statusText,
  );
}

/** Fetches path, throwing ApiError for a response outside 2xx. */
export async function send(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(path, init);
  if (!response.ok) {
    throw await readError(response);
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

const UNAVAILABLE = 'The service is busy or unavailable; try again shortly.';

/** What the backend means by each status it answers with. */
const MESSAGES: Record<number, string> = {
  404: 'Not found.',
  429: 'Too many questions; try again in a minute.',
  502: 'The question could not be turned into a search.',
  503: UNAVAILABLE,
  504: 'The search took too long; narrow it and try again.',
};

// nginx answers 502 while the backend starts or is down, and 504 when it does not answer
// in time.
const GATEWAY_STATUSES = new Set([502, 504]);

/** What to tell the user about a failed request. */
export function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'The viewer could not reach its server.';
  }
  if (error.status === 422) {
    return error.detail;
  }
  if (!error.fromBackend && GATEWAY_STATUSES.has(error.status)) {
    return UNAVAILABLE;
  }
  return (
    MESSAGES[error.status] ?? `The server answered ${error.status}: ${error.detail}`
  );
}

/** Whether the server said the thing asked for does not exist. */
export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}
