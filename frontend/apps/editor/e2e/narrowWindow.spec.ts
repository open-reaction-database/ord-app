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
import { seedReaction, seedTemplate } from './seed.ts';
import { LOADER, waitForReactionPageToSettle } from './settle.ts';

const urls = { dataset: '', reaction: '', template: '' };
let templateName: string;

test.beforeAll(async ({ request }) => {
  const seeded = await seedReaction(request);
  const template = await seedTemplate(request, seeded);
  urls.dataset = `/datasets/${seeded.datasetId}`;
  urls.reaction = `/datasets/${seeded.datasetId}/reactions/${seeded.reactionId}`;
  urls.template = `/templates/${template.templateId}`;
  templateName = template.name;
});

// Narrower than the 1280 px window the screenshots use.
test.use({ viewport: { width: 800, height: 900 } });

/** Each page, and how to open it and wait until its content has loaded. */
const PAGES: Array<[string, (page: Page) => Promise<void>]> = [
  [
    'the datasets list',
    async page => {
      await page.goto('/datasets', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('table')).toBeVisible({ timeout: 30_000 });
    },
  ],
  [
    'a dataset page',
    async page => {
      await page.goto(urls.dataset, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('link', { name: 'e2e-reaction-page' })).toBeVisible({
        timeout: 30_000,
      });
    },
  ],
  [
    'a reaction page',
    async page => {
      await page.goto(urls.reaction, { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('acid', { exact: true }).first()).toBeVisible({
        timeout: 30_000,
      });
      await waitForReactionPageToSettle(page);
    },
  ],
  [
    'the templates list',
    async page => {
      await page.goto('/templates', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText(templateName)).toBeVisible({ timeout: 30_000 });
    },
  ],
  [
    'a template page',
    async page => {
      await page.goto(urls.template, { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('acid', { exact: true }).first()).toBeVisible({
        timeout: 30_000,
      });
    },
  ],
];

for (const [name, open] of PAGES) {
  test(`${name} fits a narrow window without scrolling sideways`, async ({ page }) => {
    await open(page);
    await expect(page.locator(LOADER)).toHaveCount(0);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
}

test('a dataset page shows each reaction card’s whole title in a narrow window', async ({
  page,
}) => {
  await page.goto(urls.dataset, { waitUntil: 'domcontentloaded' });
  const link = page.getByRole('link', { name: 'e2e-reaction-page' });
  await expect(link).toBeVisible({ timeout: 30_000 });
  await expect(link).toBeInViewport({ ratio: 1 });
});
