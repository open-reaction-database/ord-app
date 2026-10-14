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

test('answers a question with its reactions', async ({ page }) => {
  await page.goto('/ask');
  await expect(page.getByText(/in development/)).toBeVisible();
  await page
    .getByRole('textbox', { name: 'Question' })
    .fill('reactions that use acetyl chloride');
  await page.getByRole('button', { name: 'Ask' }).click();
  await expect(page.getByText('Three reactions use acetyl chloride.')).toBeVisible();
  await expect(page.getByRole('link', { name: REACTION_LINK })).toHaveText([
    'ord-viewer0102',
    'ord-viewer0103',
    'ord-viewer0201',
  ]);
  await page.getByRole('button', { name: 'The query it ran' }).click();
  await expect(page.getByText('"same_compound"', { exact: false })).toBeVisible();
});

test('answers a question with a table', async ({ page }) => {
  await page.goto(
    `/ask?${new URLSearchParams({ q: 'how many reactions are in each dataset' })}`,
  );
  const table = page.getByRole('table');
  await expect(table).toContainText('ord_dataset-viewer01');
  await expect(table).toContainText('3');
});

test('says why it cannot answer a question', async ({ page }) => {
  await page.goto(`/ask?${new URLSearchParams({ q: 'what does pyridine cost' })}`);
  await expect(page.getByRole('alert')).toContainText('no script');
});
