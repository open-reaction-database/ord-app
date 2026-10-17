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
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('browses from the datasets to a dataset and its reactions', async ({ page }) => {
  await page.goto('/datasets');
  const filter = page.getByRole('textbox', { name: 'Filter' });
  await expect(page.getByRole('link', { name: 'viewer one' })).toBeVisible();
  await filter.fill('ord_dataset-viewer02');
  await expect(page.getByRole('link', { name: 'viewer one' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'viewer two' })).toBeVisible();
  await filter.fill('');
  await page.getByRole('link', { name: 'viewer one' }).click();
  await expect(page).toHaveURL('/datasets/ord_dataset-viewer01');
  await expect(page.getByRole('heading', { name: 'viewer one' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Reactions in this dataset (3)' }),
  ).toBeVisible();
  for (const id of ['ord-viewer0101', 'ord-viewer0102', 'ord-viewer0103']) {
    await expect(page.getByRole('link', { name: id, exact: true })).toBeVisible();
  }
});

test("draws a compound's molecule when its bar is hovered", async ({ page }) => {
  await page.goto('/datasets/ord_dataset-viewer01');
  await page.locator('.recharts-bar-rectangle').first().hover();
  await expect(
    page.locator('.recharts-tooltip-wrapper img[src^="data:image/svg+xml"]'),
  ).toBeVisible();
});

test("downloads a dataset's reactions as gzip", async ({ page }) => {
  await page.goto('/datasets/ord_dataset-viewer01');
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download all' }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe('ord-search-results.pb.gz');
  const bytes = await readFile(await download.path());
  expect([...bytes.subarray(0, 2)]).toEqual([0x1f, 0x8b]);
});
