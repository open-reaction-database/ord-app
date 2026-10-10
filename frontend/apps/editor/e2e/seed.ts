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
import type { APIRequestContext } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const API = process.env.VITE_API_ENDPOINT ?? 'http://127.0.0.1:8000/service_api/api/v1';
// In e2e mode the backend accepts any bearer token as the dev user.
const TOKEN = 'e2e-dev-token';
const headers = { Authorization: `Bearer ${TOKEN}` };

async function post<T>(
  request: APIRequestContext,
  url: string,
  options: object,
): Promise<T> {
  const response = await request.post(`${API}${url}`, { headers, ...options });
  if (!response.ok()) {
    throw new Error(
      `POST ${url} returned ${response.status()}: ${await response.text()}`,
    );
  }
  return (await response.json()) as T;
}

/** Creates a group, a dataset in it, and the fixture reaction, as the e2e dev user. */
export async function seedReaction(
  request: APIRequestContext,
): Promise<{ datasetId: number; reactionId: number }> {
  await post(request, '/auth/jit-provisioning', {
    data: { access_token: TOKEN, id_token: TOKEN },
  });
  const group = await post<{ id: number }>(request, '/groups', {
    data: { name: `e2e reaction page ${Date.now()}` },
  });
  const dataset = await post<{ id: number }>(request, `/groups/${group.id}/datasets`, {
    data: { name: 'Reaction page' },
  });
  const reaction = await post<{ id: number }>(
    request,
    `/datasets/${dataset.id}/reactions/upload`,
    {
      multipart: {
        file: {
          name: 'reaction.pbtxt',
          mimeType: 'text/plain',
          buffer: readFileSync(
            path.join(import.meta.dirname, 'fixtures', 'reaction.pbtxt'),
          ),
        },
      },
    },
  );
  return { datasetId: dataset.id, reactionId: reaction.id };
}
