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
import { expect, test } from '@playwright/test';
import { seedReadOnlyReaction } from './seed.ts';

/** Buttons the reaction page shows only when the user may edit the reaction. */
const PAGE_EDIT_CONTROLS = ['Remove', 'Rename reaction', 'Input', 'Edit'];

/** Buttons a drawer form shows only when the user may edit the reaction. */
const DRAWER_EDIT_CONTROLS = ['Save', 'Save and Close', 'Paste Chunk'];

let reactionUrl: string;

test.beforeAll(async ({ request }) => {
  const { datasetId, reactionId } = await seedReadOnlyReaction(request);
  reactionUrl = `/datasets/${datasetId}/reactions/${reactionId}`;
});

test('a read-only reaction shows no edit controls, in the page or the drawer', async ({
  page,
}) => {
  await page.goto(reactionUrl, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('acid', { exact: true }).first()).toBeVisible({
    timeout: 30_000,
  });
  // Edit rights are decided once the user and the dataset's groups load; wait for both.
  await expect(page.getByText('E2E User', { exact: true })).toBeVisible();
  await page.waitForLoadState('networkidle');

  for (const name of PAGE_EDIT_CONTROLS) {
    await expect(page.getByRole('button', { name, exact: true })).toHaveCount(0);
  }
  await expect(page.getByRole('button', { name: /^Remove / })).toHaveCount(0);

  await page.getByRole('button', { name: 'View', exact: true }).first().click();
  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('button', { name: /^Remove / })).toHaveCount(0);
  for (const name of DRAWER_EDIT_CONTROLS) {
    await expect(drawer.getByRole('button', { name, exact: true })).toHaveCount(0);
  }
});
