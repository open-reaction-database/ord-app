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
import { seedReaction } from './seed.ts';

test.beforeAll(async ({ request }) => {
  await seedReaction(request);
});

// A 1280 px window less the 16 px a classic scrollbar takes; headless Chromium draws none.
test.use({ viewport: { width: 1264, height: 1080 } });

test('shows each dataset’s download menu without scrolling the table', async ({
  page,
}) => {
  await page.goto('/datasets', { waitUntil: 'domcontentloaded' });
  const menu = page.getByRole('button', { name: 'Download dataset' }).first();
  await expect(menu).toBeVisible({ timeout: 30_000 });
  // Counts only the part inside the window and not clipped by the table's container.
  await expect(menu).toBeInViewport({ ratio: 1 });
});

test('fills each truncating column with its text', async ({ page }) => {
  await page.goto('/datasets', { waitUntil: 'domcontentloaded' });
  // The first data row, rather than the loading skeleton the table shows before it.
  await expect(
    page.getByRole('button', { name: 'Download dataset' }).first(),
  ).toBeVisible({
    timeout: 30_000,
  });
  for (const header of ['Dataset Name', 'Owner', 'Description']) {
    // How much the first row's text differs in width from its cell's content box.
    const gap = () =>
      page.evaluate(name => {
        const headers = Array.from(document.querySelectorAll('thead th'));
        const column = headers.findIndex(th => th.textContent?.trim() === name);
        const cell = document.querySelectorAll('tbody tr')[0].children[column];
        const style = getComputedStyle(cell);
        const content =
          cell.clientWidth -
          parseFloat(style.paddingLeft) -
          parseFloat(style.paddingRight);
        const text = cell.querySelector(':scope > div')!.getBoundingClientRect().width;
        return Math.abs(content - text);
      }, header);
    await expect
      .poll(gap, { message: `${header} text misses its column` })
      .toBeLessThanOrEqual(1);
  }
});

test.describe('in a window too narrow for the table', () => {
  test.use({ viewport: { width: 640, height: 900 } });

  test('takes the description and owner to their minimums, and keeps the name whole', async ({
    page,
  }) => {
    await page.goto('/datasets', { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByRole('button', { name: 'Download dataset' }).first(),
    ).toBeVisible({
      timeout: 30_000,
    });
    const width = async (name: string) =>
      (await page.getByRole('columnheader', { name, exact: true }).boundingBox())!
        .width;
    await expect.poll(() => width('Description')).toBe(120);
    await expect.poll(() => width('Owner')).toBe(100);
    await expect.poll(() => width('Dataset Name')).toBe(230);
  });
});
