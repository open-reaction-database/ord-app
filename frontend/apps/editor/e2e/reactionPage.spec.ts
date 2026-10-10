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
import { expect, test, type Page } from '@playwright/test';
import { seedReaction } from './seed.ts';

/** What differs between runs: the reaction ID the upload assigns, and the footer's year. */
function changingContent(page: Page) {
  return [page.getByText(/^[0-9a-f]{32}$/), page.getByText(/Copyright \d{4}/)];
}

let reactionUrl: string;

test.beforeAll(async ({ request }) => {
  const { datasetId, reactionId } = await seedReaction(request);
  reactionUrl = `/datasets/${datasetId}/reactions/${reactionId}`;
});

test.beforeEach(async ({ page }) => {
  await page.goto(reactionUrl, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('acid', { exact: true }).first()).toBeVisible({
    timeout: 30_000,
  });
});

test('switches between the tabs and list views', async ({ page }) => {
  await page.getByText('List', { exact: true }).click();
  await expect(page.getByRole('radio', { name: 'List' })).toBeChecked();
  await page.getByText('Tabs', { exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Tabs' })).toBeChecked();
});

test('opens an entity in the drawer and closes it', async ({ page }) => {
  await page.getByRole('button', { name: 'Edit' }).first().click();
  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
});

test.describe('appearance', () => {
  // A missing baseline is written by the attempt that finds it missing; a retry would then
  // match it and pass, so this test does not retry.
  test.describe.configure({ retries: 0 });

  test('looks the same', async ({ page }) => {
    // The baselines are rendered on CI's Linux runner; fonts and antialiasing differ
    // elsewhere, so a local comparison would fail on rendering alone.
    test.skip(
      !process.env.CI,
      'Screenshots are compared only in CI, where the baselines are made.',
    );
    await expect(page).toHaveScreenshot('reaction-page.png', {
      fullPage: true,
      mask: changingContent(page),
    });
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page).toHaveScreenshot('reaction-drawer.png', {
      mask: changingContent(page),
    });
  });
});
