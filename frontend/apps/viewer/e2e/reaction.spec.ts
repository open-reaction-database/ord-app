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

const PREVIEW = 'img[src^="data:image/svg+xml"]';

test('shows a reaction read-only, with its drawer', async ({ page }) => {
  await page.goto('/reactions/ord-viewer0101');
  await expect(page.getByRole('heading', { name: 'ord-viewer0101' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'viewer one' })).toBeVisible();
  await expect(page.locator(PREVIEW).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Remove', exact: true })).toHaveCount(
    0,
  );
  await page.getByRole('button', { name: 'View', exact: true }).first().click();
  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('button', { name: 'Save', exact: true })).toHaveCount(
    0,
  );
});

test("stretches a drawer's choices across their fields", async ({ page }) => {
  await page.goto('/reactions/ord-viewer0101');
  // The tab's second View opens the outcome's product, and the product's second a measurement,
  // whose value type is a group of segments that is not full width.
  await page.getByRole('tab', { name: 'outcomes' }).click();
  await page.getByRole('button', { name: 'View', exact: true }).nth(1).click();
  const drawer = page.getByRole('dialog');
  await drawer.getByRole('button', { name: 'View', exact: true }).nth(1).click();
  await expect(drawer.getByRole('radiogroup').first()).toBeVisible();
  const gaps = await drawer.getByRole('radiogroup').evaluateAll(groups =>
    groups.map(group => {
      const field = group.closest('.mantine-InputWrapper-root');
      const fieldWidth = field?.getBoundingClientRect().width ?? 0;
      return fieldWidth - group.getBoundingClientRect().width;
    }),
  );
  expect(gaps).toHaveLength(4);
  for (const gap of gaps) {
    expect(gap).toBeCloseTo(0);
  }
});

test('shows the full record', async ({ page }) => {
  await page.goto('/reactions/ord-viewer0101');
  await page.getByRole('button', { name: 'Full record' }).click();
  await expect(page.getByRole('dialog')).toContainText(
    '"reactionId": "ord-viewer0101"',
  );
});

test('shows NotFound for an unknown reaction', async ({ page }) => {
  await page.goto('/reactions/ord-nowhere');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});
