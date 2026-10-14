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

// A corpus's IDs are as long as these, and descriptions link long addresses; the test
// corpus's are short, so these replace them in what the backend answers.
const DATASET_ID = 'ord_dataset-0123456789abcdef0123456789abcdef';
const REACTION_ID = 'ord-0123456789abcdef0123456789abcdef';
const DESCRIPTION =
  'Data at https://example.com/a/long/path/that/keeps/going/without/a/break/0123456789abcdef.';
const PREVIEW = 'img[src^="data:image/svg+xml"]';

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

/**
 * Scrolls the nearest container that scrolls sideways around an element to bring it into
 * view, leaving every other container as it is; false when no such container holds it.
 */
function revealSideways(locator: Locator) {
  return locator.evaluate(element => {
    let scroller = element.parentElement;
    while (
      scroller !== null &&
      !(
        ['auto', 'scroll'].includes(getComputedStyle(scroller).overflowX) &&
        scroller.scrollWidth > scroller.clientWidth
      )
    ) {
      scroller = scroller.parentElement;
    }
    if (scroller === null) {
      return false;
    }
    // Centered, so that rounding the scroll position cannot clip an edge.
    const box = element.getBoundingClientRect();
    const view = scroller.getBoundingClientRect();
    scroller.scrollLeft += box.left + box.width / 2 - (view.left + view.width / 2);
    return true;
  });
}

/** Expects text to show whole: inside the window, unclipped by its containers, and not cut short. */
async function expectWhole(locator: Locator) {
  // Scroll the window alone down to it: scrolling the element into view would also scroll
  // any container that clips it, and hide the clip.
  await locator.evaluate(element => {
    window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 100);
  });
  await expect(locator).toBeInViewport({ ratio: 1 });
  const cut = await locator.evaluate(
    element => element.scrollWidth - element.clientWidth,
  );
  expect(cut, `${await locator.textContent()} is cut short`).toBeLessThanOrEqual(0);
}

/** How many lines an element's text runs to. */
function lineCount(locator: Locator) {
  return locator.evaluate(element => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const tops = [...range.getClientRects()].map(rect => Math.round(rect.top));
    return new Set(tops).size;
  });
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

test("shows a reaction's header on a phone", async ({ page }) => {
  await page.goto('/reactions/ord-viewer0101');
  const heading = page.getByRole('heading', { name: 'ord-viewer0101' });
  await expectWhole(heading);
  expect(await lineCount(heading), 'the ID keeps to one line').toBe(1);
  await expectWhole(page.getByText('Copy reaction image', { exact: true }));
  // The header's preview draws the two reactants, then the product, in a row that
  // scrolls within itself; the inputs table draws the reactants again.
  const previews = page.locator(PREVIEW).filter({ visible: true });
  await expect(previews).toHaveCount(5);
  const product = previews.nth(2);
  expect(await revealSideways(product)).toBe(true);
  await expect(product).toBeInViewport({ ratio: 1 });
  await expectNoSidewaysScroll(page);
});

test("scrolls a reaction's tabs within their list on a phone", async ({ page }) => {
  await page.goto('/reactions/ord-viewer0101');
  const list = page.getByRole('tablist');
  await expect(list).toBeInViewport({ ratio: 1 });
  const tabs = await page.getByRole('tab').all();
  const tops = await page
    .getByRole('tab')
    .evaluateAll(elements => elements.map(tab => tab.getBoundingClientRect().top));
  expect(new Set(tops).size, 'the tabs share one line').toBe(1);
  for (const tab of tabs) {
    expect(await revealSideways(tab)).toBe(true);
    await expectWhole(tab.locator('.mantine-Tabs-tabLabel'));
  }
  await expectNoSidewaysScroll(page);
});

const TABLES = [
  {
    tab: 'inputs',
    headers: ['Input', 'Identifiers', 'Preview', 'Role', 'Amount'],
    cells: ['REACTANT', 'UNSPECIFIED'],
  },
  {
    tab: 'outcomes',
    headers: ['Identifiers', 'Preview', 'Role', 'Measurements'],
    cells: ['UNSPECIFIED', 'YIELD'],
  },
];

for (const { tab, headers, cells } of TABLES) {
  test(`scrolls a reaction's ${tab} table within itself on a phone`, async ({
    page,
  }) => {
    await page.goto('/reactions/ord-viewer0101');
    await page.getByRole('tab', { name: tab }).click();
    const panel = page.getByRole('tabpanel');
    for (const header of headers) {
      const text = panel.getByText(header, { exact: true });
      expect(await revealSideways(text)).toBe(true);
      await expectWhole(text);
    }
    for (const cell of cells) {
      const text = panel.getByText(cell, { exact: true }).first();
      await revealSideways(text);
      await expectWhole(text);
      expect(await lineCount(text), `${cell} keeps to one line`).toBe(1);
    }
    await expectNoSidewaysScroll(page);
  });
}
