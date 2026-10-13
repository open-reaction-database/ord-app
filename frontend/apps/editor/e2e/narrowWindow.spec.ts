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

const urls = { dataset: '', reaction: '', template: '', templateWithVariables: '' };
let templateName: string;

test.beforeAll(async ({ request }) => {
  const seeded = await seedReaction(request);
  const template = await seedTemplate(request, seeded);
  urls.dataset = `/datasets/${seeded.datasetId}`;
  urls.reaction = `/datasets/${seeded.datasetId}/reactions/${seeded.reactionId}`;
  urls.template = `/templates/${template.templateId}`;
  templateName = template.name;
  const withVariables = await seedTemplate(request, seeded, [
    {
      name: 'notes',
      field: 'Safety notes',
      type: 'string',
      path: ['notes', 'safetyNotes'],
    },
  ]);
  urls.templateWithVariables = `/templates/${withVariables.templateId}`;
});

/** Window widths below the 1280 px the screenshots use, down to the narrowest a page must fit. */
const WIDTHS = [640, 800, 960];

async function openDatasetsList(page: Page) {
  await page.goto('/datasets', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('table')).toBeVisible({ timeout: 30_000 });
}

async function openDataset(page: Page) {
  await page.goto(urls.dataset, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('link', { name: 'e2e-reaction-page' })).toBeVisible({
    timeout: 30_000,
  });
  // Edit controls appear once the dataset loads and grants the dev user edit rights.
  await expect(
    page.getByRole('button', { name: 'Remove', exact: true }).first(),
  ).toBeVisible();
}

async function openReaction(page: Page) {
  await page.goto(urls.reaction, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('acid', { exact: true }).first()).toBeVisible({
    timeout: 30_000,
  });
  await waitForReactionPageToSettle(page);
}

async function openTemplate(page: Page) {
  await page.goto(urls.template, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('acid', { exact: true }).first()).toBeVisible({
    timeout: 30_000,
  });
}

interface NarrowPage {
  name: string;
  /** Opens the page and waits until its content has loaded. */
  open: (page: Page) => Promise<void>;
  /** Text that must show whole: what a narrow window is most likely to squeeze or clip. */
  whole: (page: Page) => Array<Locator>;
}

const PAGES: Array<NarrowPage> = [
  {
    name: 'the datasets list',
    open: openDatasetsList,
    whole: page => [
      page.getByText('Create dataset from scratch'),
      page.getByText('Create dataset from file'),
      page.getByText('Create dataset from template'),
    ],
  },
  {
    name: 'a dataset page',
    open: openDataset,
    whole: page => [
      page.getByText('Dataset Owner', { exact: true }),
      page.getByRole('main').getByText('E2E User', { exact: true }),
      page.getByText('Dataset ID', { exact: true }),
      page.getByText('Last Modified', { exact: true }),
      page.getByText('Download as', { exact: true }),
      page.getByText('Reaction', { exact: true }),
      page.getByRole('link', { name: 'e2e-reaction-page' }),
      page.getByText('Download Reaction', { exact: true }),
    ],
  },
  {
    name: 'a reaction page',
    open: openReaction,
    whole: page => [
      page.getByText('Save as Template', { exact: true }),
      page.getByText('Download Reaction', { exact: true }),
    ],
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
        page.getByText('Upload JSON file', { exact: true }),
        page.getByText('Create dataset from template'),
        card.getByRole('link', { name: templateName }),
        card.getByText('Download Template in JSON', { exact: true }),
      ];
    },
  },
  {
    name: 'a template page',
    open: openTemplate,
    whole: page => [
      page.getByText('Not Ready for Enumeration: No Variables'),
      page.getByText('Download Variables in CSV', { exact: true }),
      page.getByText('Download Template in JSON', { exact: true }),
    ],
  },
];

/** Drawers, each opened from its page. */
const DRAWERS: Array<{ name: string; open: (page: Page) => Promise<void> }> = [
  {
    name: 'a reaction entity',
    open: async page => {
      await openReaction(page);
      await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
    },
  },
  {
    name: 'a reaction’s validation messages',
    open: async page => {
      await openReaction(page);
      await page.getByRole('button', { name: /error/ }).click();
    },
  },
  {
    name: 'sharing a dataset',
    open: async page => {
      await openDataset(page);
      await page.getByRole('button', { name: 'Share', exact: true }).click();
    },
  },
  {
    name: 'a template’s variables',
    open: async page => {
      await page.goto(urls.templateWithVariables, { waitUntil: 'domcontentloaded' });
      await page
        .getByRole('button', { name: 'Template is valid' })
        .click({ timeout: 30_000 });
    },
  },
  {
    name: 'an enumeration',
    open: async page => {
      await openDatasetsList(page);
      await page.getByRole('button', { name: /Enumerate/ }).click();
    },
  },
];

/** How far the page scrolls sideways, in pixels. */
function sidewaysOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

/** Expects text to show whole: inside the window, unclipped by its containers, and not cut short. */
async function expectWhole(locator: Locator) {
  // Scroll the window alone: scrolling the element into view would also scroll any container
  // that clips it, and hide the clip.
  await locator.evaluate(element => {
    window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 100);
  });
  await expect(locator).toBeInViewport({ ratio: 1 });
  // An inline element measures 0 for both, so only a block's own overflow shows here.
  const cut = await locator.evaluate(
    element => element.scrollWidth - element.clientWidth,
  );
  expect(cut, `${await locator.textContent()} is cut short`).toBeLessThanOrEqual(0);
}

for (const width of WIDTHS) {
  test.describe(`in a ${width} px window`, () => {
    test.use({ viewport: { width, height: 900 } });

    for (const { name, open, whole } of PAGES) {
      test(`${name} fits without scrolling sideways, its text whole`, async ({
        page,
      }) => {
        await open(page);
        await expect(page.locator(LOADER)).toHaveCount(0, { timeout: 30_000 });
        await expect.poll(() => sidewaysOverflow(page)).toBe(0);
        for (const locator of whole(page)) {
          await expectWhole(locator);
        }
      });
    }

    for (const { name, open } of DRAWERS) {
      test(`the drawer for ${name} fits, its header whole`, async ({ page }) => {
        await open(page);
        const header = page.locator('.mantine-Drawer-header');
        await expect(header).toBeVisible();
        await expectWhole(header);
      });
    }
  });
}
