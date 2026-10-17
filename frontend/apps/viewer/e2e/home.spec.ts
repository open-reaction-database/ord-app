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

test('opens the newest submission from the front page', async ({ page }) => {
  await page.goto('/');
  // viewer one was changed after viewer two was submitted, and is still the older one.
  await expect(page.getByText('Recently added · Jun 15, 2025')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'viewer two' })).toBeVisible();
  await page.getByRole('link', { name: 'View dataset →' }).click();
  await expect(page).toHaveURL('/datasets/ord_dataset-viewer02');
  await expect(page.getByRole('heading', { name: 'viewer two' })).toBeVisible();
});

test('asks a question from the front page', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('textbox', { name: 'Question' })
    .fill('reactions that use acetyl chloride');
  await page.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(page).toHaveURL(/\/ask\?q=reactions\+that\+use\+acetyl\+chloride$/);
  await expect(page.getByText('Three reactions use acetyl chloride.')).toBeVisible();
});

test('browses from the front page, and comes back by the logo', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('datasets', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Browse datasets' }).click();
  await expect(page).toHaveURL('/datasets');
  await expect(page.getByRole('link', { name: 'viewer one' })).toBeVisible();
  await page.getByRole('link', { name: 'Open Reaction Database logo' }).click();
  await expect(page).toHaveURL('/');
  await expect(
    page.getByRole('heading', { name: 'The Open Reaction Database' }),
  ).toBeVisible();
});
