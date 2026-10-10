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

/**
 * What differs between runs: the footer's year. The fixture sets its own reaction ID, since
 * one the upload assigned would change the heading's width, and with it the layout beside it.
 */
function changingContent(page: Page) {
  return [page.getByText(/Copyright \d{4}/)];
}

const PREVIEW = 'img[src^="data:image/svg+xml"]';
const LOADER = '.mantine-Loader-root';

/** Waits for what the page loads after the reaction itself, so a screenshot shows it all. */
async function waitForPageToSettle(page: Page) {
  // Edit controls appear once the dataset loads and grants the dev user edit rights.
  await expect(page.getByRole('button', { name: 'Remove', exact: true })).toBeVisible();
  // The user menu appears once the signed-in user loads.
  await expect(page.getByText('E2E User', { exact: true })).toBeVisible();
  // The Indigo worker renders the molecule previews: three in the header and two in the
  // inputs list.
  await expect(page.locator(LOADER)).toHaveCount(0);
  await expect(page.locator(PREVIEW).filter({ visible: true })).toHaveCount(5);
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
  await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
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
    await waitForPageToSettle(page);
    await expect(page).toHaveScreenshot('reaction-page.png', {
      fullPage: true,
      mask: changingContent(page),
    });
    await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    // The drawer shows the first input's single component preview.
    await expect(drawer.locator(LOADER)).toHaveCount(0);
    await expect(drawer.locator(PREVIEW)).toHaveCount(1);
    await expect(page).toHaveScreenshot('reaction-drawer.png', {
      mask: changingContent(page),
    });
  });
});
