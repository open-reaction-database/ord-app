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

const REACTION_LINK = /^ord-viewer\d{4}$/;

test('shows a selected set in the order given', async ({ page }) => {
  await page.goto('/reactions?id=ord-viewer0103&id=ord-viewer0101');
  const links = page.getByRole('link', { name: REACTION_LINK });
  await expect(links).toHaveText(['ord-viewer0103', 'ord-viewer0101']);
});

test("redirects ord-interface's paths", async ({ page }) => {
  await page.goto('/selected-set?reaction_id=ord-viewer0102');
  await expect(page).toHaveURL('/reactions?id=ord-viewer0102');
  await page.goto('/id/ord-viewer0102');
  await expect(page).toHaveURL('/reactions/ord-viewer0102');
  await expect(page.getByRole('heading', { name: 'ord-viewer0102' })).toBeVisible();
});

test('shows NotFound for an unknown path', async ({ page }) => {
  await page.goto('/nowhere');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});
