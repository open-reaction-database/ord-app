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

// A corpus's IDs are as long as these, and descriptions link long addresses; the test
// corpus's are short, so these replace them in what the backend answers.
const DATASET_ID = 'ord_dataset-0123456789abcdef0123456789abcdef';
const REACTION_ID = 'ord-0123456789abcdef0123456789abcdef';
const DESCRIPTION =
  'Data at https://example.com/a/long/path/that/keeps/going/without/a/break/0123456789abcdef.';

test.use({ viewport: { width: 375, height: 812 } });

async function withLongIds(page: Page) {
  await page.route('**/api/datasets', async route => {
    const datasets = await (await route.fetch()).json();
    await route.fulfill({
      json: [{ ...datasets[0], dataset_id: DATASET_ID, description: DESCRIPTION }],
    });
  });
  await page.route(`**/api/datasets/${DATASET_ID}`, route =>
    route.fulfill({
      json: {
        dataset_id: DATASET_ID,
        name: 'viewer one',
        description: DESCRIPTION,
        reactions: 3,
      },
    }),
  );
  await page.route(`**/api/datasets/${DATASET_ID}/compounds?*`, route =>
    route.fulfill({ json: [] }),
  );
  await page.route('**/api/search', route =>
    route.fulfill({
      json: { kind: 'reactions', reaction_ids: ['ord-viewer0101'], truncated: false },
    }),
  );
  await page.route('**/api/reactions?*', async route => {
    const records = await (await route.fetch()).json();
    await route.fulfill({
      json: records.map((record: object) => ({
        ...record,
        reaction_id: REACTION_ID,
        dataset_id: DATASET_ID,
      })),
    });
  });
}

async function expectNoSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
}

test('lists datasets with long IDs and links on a phone', async ({ page }) => {
  await withLongIds(page);
  await page.goto('/');
  await expect(
    page.getByRole('link', { name: 'https://example.com', exact: false }),
  ).toBeVisible();
  await expectNoSidewaysScroll(page);
});

test("shows a dataset's whole description on a phone", async ({ page }) => {
  await withLongIds(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Show all of the description' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('link')).toBeInViewport({ ratio: 1 });
  await expect(dialog.getByText(DATASET_ID)).toBeInViewport({ ratio: 1 });
  await expectNoSidewaysScroll(page);
});

test('shows a dataset with a long ID and link on a phone', async ({ page }) => {
  await withLongIds(page);
  await page.goto(`/datasets/${DATASET_ID}`);
  await expect(page.getByRole('link', { name: REACTION_ID })).toBeVisible();
  await expect(page.getByRole('link', { name: DATASET_ID })).toBeInViewport({
    ratio: 1,
  });
  await expectNoSidewaysScroll(page);
});

test('shows a selected set with long IDs on a phone', async ({ page }) => {
  await withLongIds(page);
  await page.goto('/reactions?id=ord-viewer0101');
  await expect(page.getByRole('link', { name: REACTION_ID })).toBeInViewport({
    ratio: 1,
  });
  await expect(page.getByRole('link', { name: DATASET_ID })).toBeInViewport({
    ratio: 1,
  });
  await expectNoSidewaysScroll(page);
});

test('shows search results with long IDs on a phone', async ({ page }) => {
  await withLongIds(page);
  await page.goto('/search?reaction_id=ord-viewer0101&limit=100');
  // On a phone the form comes first and the results below it.
  const link = page.getByRole('link', { name: REACTION_ID });
  await link.scrollIntoViewIfNeeded();
  await expect(link).toBeInViewport({ ratio: 1 });
  await expect(
    page.getByRole('checkbox', { name: `Select ${REACTION_ID}` }),
  ).toBeInViewport();
  await expectNoSidewaysScroll(page);
});

test('shows a wide table on a phone, scrolling inside it', async ({ page }) => {
  await page.route('**/api/search', route =>
    route.fulfill({
      json: {
        kind: 'table',
        columns: ['reaction_id', 'dataset_id', 'description'],
        rows: [[REACTION_ID, DATASET_ID, DESCRIPTION]],
        truncated: false,
      },
    }),
  );
  await page.goto('/search?reaction_id=ord-viewer0101&limit=100');
  const table = page.getByRole('table');
  await table.scrollIntoViewIfNeeded();
  await expect(
    table.getByRole('columnheader', { name: 'reaction_id' }),
  ).toBeInViewport();
  await expectNoSidewaysScroll(page);
});
