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

const PREVIEW = 'img[src^="data:image/svg+xml"]';
const LOADER = '.mantine-Loader-root';

test.describe.configure({ retries: 0 });
// The footer is fixed to the viewport's bottom, so a full-page capture would draw it over
// the content; these capture the viewport, tall enough to show what each test checks.
test.use({ viewport: { width: 1280, height: 1080 } });

// What differs between runs: the footer's year.
function changingContent(page: Page) {
  return [page.getByText(/Copyright \d{4}/)];
}

async function settle(page: Page, previews: number) {
  await expect(page.locator(LOADER)).toHaveCount(0);
  await expect(page.locator(PREVIEW).filter({ visible: true })).toHaveCount(previews);
}

test.beforeEach(() => {
  // The baselines are rendered on CI's Linux runner; fonts and antialiasing differ
  // elsewhere, so a local comparison would fail on rendering alone.
  test.skip(
    !process.env.CI,
    'Screenshots are compared only in CI, where the baselines are made.',
  );
});

test('the reaction page looks the same', async ({ page }) => {
  await page.goto('/reactions/ord-viewer0101');
  // Three molecules in the header's preview, and two reactants in the inputs.
  await settle(page, 5);
  await expect(page).toHaveScreenshot('reaction-page.png', {
    mask: changingContent(page),
  });
});

test('a dataset page looks the same', async ({ page }) => {
  await page.goto('/datasets/ord_dataset-viewer01');
  // Three reactions' previews of three molecules each.
  await settle(page, 9);
  await expect(page).toHaveScreenshot('dataset-page.png', {
    mask: changingContent(page),
  });
});
