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

// West of Greenwich, where a day read as local time would show as the day before.
test.use({ timezoneId: 'America/Los_Angeles' });

test('opens the newest arrival from the front page', async ({ page }) => {
  await page.goto('/');
  // A reaction was added to viewer one after viewer two arrived, and viewer one is
  // still the earlier arrival.
  await expect(page.getByText('Recently added · Mar 2, 2023')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'viewer two' })).toBeVisible();
  // On a desktop the card sits beside the description, above the question box.
  const view = page.getByRole('link', { name: 'View dataset →' });
  const cardBottom = await view.evaluate(link => link.getBoundingClientRect().bottom);
  const questionTop = await page
    .getByRole('textbox', { name: 'Question' })
    .evaluate(box => box.getBoundingClientRect().top);
  expect(cardBottom).toBeLessThan(questionTop);
  await view.click();
  await expect(page).toHaveURL('/datasets/ord_dataset-viewer02');
  await expect(page.getByRole('heading', { name: 'viewer two' })).toBeVisible();
});

test('asks a question from the front page', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('textbox', { name: 'Question' })
    .fill('reactions that use acetyl chloride');
  await page.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(page).toHaveURL(/\/ask#q=reactions\+that\+use\+acetyl\+chloride$/);
  await expect(page.getByText('Three reactions use acetyl chloride.')).toBeVisible();
});

test('searches by structure and conditions from the front page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Beta', { exact: true })).toBeVisible();
  await page
    .getByRole('link', { name: 'Or search by structure and conditions →' })
    .click();
  await expect(page).toHaveURL('/search');
  await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
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
