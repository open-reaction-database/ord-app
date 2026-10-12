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
import { expect, test, type Locator, type Page } from '@playwright/test';
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

interface NarrowPage {
  name: string;
  /** Opens the page and waits until its content has loaded. */
  open: (page: Page) => Promise<void>;
  /** What must show whole, neither clipped by a container nor cut short by its own overflow. */
  whole: (page: Page) => Array<Locator>;
}

const PAGES: Array<NarrowPage> = [
  {
    name: 'the datasets list',
    open: async page => {
      await page.goto('/datasets', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('table')).toBeVisible({ timeout: 30_000 });
    },
    whole: page => [page.getByRole('heading', { name: 'Datasets', exact: true })],
  },
  {
    name: 'a dataset page',
    open: async page => {
      await page.goto(urls.dataset, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('link', { name: 'e2e-reaction-page' })).toBeVisible({
        timeout: 30_000,
      });
    },
    whole: page => [
      page.getByText('Dataset Owner', { exact: true }),
      page.getByText('Dataset ID', { exact: true }),
      page.getByRole('button', { name: 'Download as' }),
      page.getByRole('link', { name: 'e2e-reaction-page' }),
      page.getByRole('button', { name: 'Download Reaction' }),
    ],
  },
  {
    name: 'a reaction page',
    open: async page => {
      await page.goto(urls.reaction, { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('acid', { exact: true }).first()).toBeVisible({
        timeout: 30_000,
      });
      await waitForReactionPageToSettle(page);
    },
    whole: page => [page.getByRole('button', { name: 'Download Reaction' })],
  },
  {
    name: 'the templates list',
    open: async page => {
      await page.goto('/templates', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('link', { name: templateName })).toBeVisible({
        timeout: 30_000,
      });
    },
    whole: page => {
      const card = page
        .locator('.mantine-Paper-root')
        .filter({ has: page.getByRole('link', { name: templateName }) });
      return [
        card.getByRole('link', { name: templateName }),
        card.getByRole('button', { name: 'Download Template in JSON' }),
      ];
    },
  },
  {
    name: 'a template page',
    open: async page => {
      await page.goto(urls.template, { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('acid', { exact: true }).first()).toBeVisible({
        timeout: 30_000,
      });
    },
    whole: page => [
      page.getByText('Not Ready for Enumeration: No Variables'),
      page.getByRole('button', { name: 'Download Template in JSON' }),
    ],
  },
];

for (const { name, open, whole } of PAGES) {
  test(`${name} fits a narrow window, its controls whole, without scrolling sideways`, async ({
    page,
  }) => {
    await open(page);
    await expect(page.locator(LOADER)).toHaveCount(0);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
    for (const locator of whole(page)) {
      await locator.scrollIntoViewIfNeeded();
      await expect(locator).toBeInViewport({ ratio: 1 });
      const cut = await locator.evaluate(
        element => element.scrollWidth - element.clientWidth,
      );
      expect(cut, `${await locator.textContent()} is cut short`).toBeLessThanOrEqual(0);
    }
  });
}
