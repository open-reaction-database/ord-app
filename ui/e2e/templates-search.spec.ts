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
import { test, expect, type APIRequestContext } from '@playwright/test';
import { ord } from 'ord-schema-protobufjs';

const API =
  process.env.VITE_API_ENDPOINT ?? 'http://127.0.0.1:8000/service_api/api/v1';
const TOKEN = process.env.VITE_E2E_DEV_TOKEN ?? 'e2e-dev-token';
const AUTH = { Authorization: `Bearer ${TOKEN}` };

// Unique prefix so this file's seeds do not collide with other parallel e2e runs / leftover data.
const PREFIX = `e2e-search-${Date.now()}-`;
const NAME_A = `${PREFIX}benzaldehyde coupling`;
const NAME_B = `${PREFIX}suzuki cross-coupling`;

function minimalBinpb(): string {
  const encoded = ord.Reaction.encode(
    ord.Reaction.create({ reactionId: 'e2e-templates-search' }),
  ).finish();
  return Buffer.from(encoded).toString('base64');
}

async function jitProvision(request: APIRequestContext) {
  const response = await request.post(`${API}/auth/jit-provisioning`, {
    headers: AUTH,
    data: { access_token: TOKEN, id_token: TOKEN },
  });
  expect(response.ok()).toBeTruthy();
}

async function createTemplate(
  request: APIRequestContext,
  name: string,
): Promise<number> {
  const response = await request.post(`${API}/templates`, {
    headers: AUTH,
    data: {
      name,
      binpb: minimalBinpb(),
      // Match createTemplate thunk: stringified empty list (API Json field).
      variables: JSON.stringify([]),
    },
  });
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { id: number };
  return body.id;
}

async function deleteTemplate(request: APIRequestContext, id: number) {
  await request.delete(`${API}/templates/${id}`, { headers: AUTH });
}

test.describe.configure({ mode: 'serial' });

test.describe('Templates list search', () => {
  const seededIds: number[] = [];

  test.beforeAll(async ({ request }) => {
    // Seed before any UI load: getAllTemplates() runs once on Routes mount.
    await jitProvision(request);
    seededIds.push(await createTemplate(request, NAME_A));
    seededIds.push(await createTemplate(request, NAME_B));
  });

  test.afterAll(async ({ request }) => {
    for (const id of seededIds) {
      await deleteTemplate(request, id);
    }
  });

  test('filters by name and clears the empty state', async ({ page }) => {
    await page.goto('/templates', { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', { name: 'Templates', level: 2 }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(NAME_A)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(NAME_B)).toBeVisible();

    const search = page.getByRole('textbox', { name: 'Search saved templates' });
    await search.fill('benz');

    await expect(page.getByText(NAME_A)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(NAME_B)).not.toBeVisible();

    await search.fill('zzzz-no-match');
    await expect(
      page.getByText('No saved templates match your search.'),
    ).toBeVisible({ timeout: 5_000 });

    // Input X and empty-state button share the same accessible name.
    await page.getByRole('button', { name: 'Clear search' }).first().click();
    await expect(page.getByText(NAME_A)).toBeVisible();
    await expect(page.getByText(NAME_B)).toBeVisible();
  });
});
