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
import { vi } from 'vitest';

/**
 * Answers fetch from a table of routes, and records what was asked.
 *
 * A route's answer is a JSON body, or a function returning a fresh Response.
 * A key is "<METHOD> <path>" or, to match one query string exactly,
 * "<METHOD> <path>?<query>"; an exact key wins. A function answer is called for each
 * request, since a Response's body can be read only once. Any other request answers
 * 404 with FastAPI's body.
 */
export function mockApi(routes: Record<string, unknown>) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = new URL(String(input), 'http://viewer.test');
    const method = init?.method ?? 'GET';
    const exact = `${method} ${url.pathname}${url.search}`;
    const loose = `${method} ${url.pathname}`;
    const answer = exact in routes ? routes[exact] : routes[loose];
    if (answer === undefined) {
      return new Response(JSON.stringify({ detail: 'Not Found' }), { status: 404 });
    }
    if (typeof answer === 'function') {
      return (answer as () => Response)();
    }
    return new Response(JSON.stringify(answer));
  });
}
