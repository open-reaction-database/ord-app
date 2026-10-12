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
import { seedReaction } from './seed.ts';

const PREVIEW = 'img[src^="data:image/svg+xml"]';
const LOADER = '.mantine-Loader-root';

let datasetUrl: string;

test.beforeAll(async ({ request }) => {
  const { datasetId } = await seedReaction(request);
  datasetUrl = `/datasets/${datasetId}`;
});

test.describe('appearance', () => {
  // A missing baseline is written by the attempt that finds it missing; a retry would then
  // match it and pass, so this test does not retry.
  test.describe.configure({ retries: 0 });
  // Tall enough that the footer, which is fixed to the bottom of the viewport, sits below
  // the first card instead of over it.
  test.use({ viewport: { width: 1280, height: 1080 } });

  test('a reaction card looks the same', async ({ page }) => {
    // The baselines are rendered on CI's Linux runner; fonts and antialiasing differ
    // elsewhere, so a local comparison would fail on rendering alone.
    test.skip(
      !process.env.CI,
      'Screenshots are compared only in CI, where the baselines are made.',
    );
    await page.goto(datasetUrl, { waitUntil: 'domcontentloaded' });
    const link = page.getByRole('link', { name: 'e2e-reaction-page' });
    await expect(link).toBeVisible({ timeout: 30_000 });
    const card = page.locator('.mantine-Paper-root').filter({ has: link });
    // Edit rights arrive with the dataset; Remove shows once they have.
    await expect(
      card.getByRole('button', { name: 'Remove', exact: true }),
    ).toBeVisible();
    // Two input previews and one product preview, from the Indigo worker.
    await expect(card.locator(LOADER)).toHaveCount(0);
    await expect(card.locator(PREVIEW)).toHaveCount(3);
    await expect(card).toHaveScreenshot('dataset-card.png');
  });
});
