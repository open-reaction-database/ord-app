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
import { seedReaction } from './seed.ts';

let datasetUrl = '';

test.beforeAll(async ({ request }) => {
  const { datasetId } = await seedReaction(request);
  datasetUrl = `/datasets/${datasetId}`;
});

async function openDataset(page: Page) {
  await page.goto(datasetUrl, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('link', { name: 'e2e-reaction-page' })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByRole('contentinfo')).toContainText('© Copyright');
}

interface Box {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** Scrolls the window to the end and measures the footer, its items, and the page's content. */
function scrollToEndAndMeasure(page: Page) {
  return page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
    const box = (element: Element): Box => {
      const { top, bottom, left, right } = element.getBoundingClientRect();
      return { top, bottom, left, right };
    };
    const footer = document.querySelector('footer') as HTMLElement;
    const content = document.querySelector('main')?.firstElementChild as HTMLElement;
    return {
      windowWidth: document.documentElement.clientWidth,
      windowHeight: window.innerHeight,
      documentHeight: document.documentElement.scrollHeight,
      footer: box(footer),
      items: Array.from(footer.querySelectorAll(':scope > div > *'), box),
      content: box(content),
      contentHeight: content.offsetHeight,
    };
  });
}

/**
 * Window widths on either side of Mantine's sm breakpoint (768 px), where the footer changes, and
 * whether the footer's items wrap there.
 */
const WIDTHS = [
  { width: 375, belowSm: true, wraps: true },
  { width: 640, belowSm: true, wraps: false },
  { width: 1024, belowSm: false, wraps: false },
];

for (const { width, belowSm, wraps } of WIDTHS) {
  test.describe(`the page footer in a ${width} px window`, () => {
    test.describe('on a page longer than the window', () => {
      test.use({ viewport: { width, height: 600 } });

      test('holds its items, stays at the window’s bottom, and covers no content', async ({
        page,
      }) => {
        await openDataset(page);
        const measured = await scrollToEndAndMeasure(page);
        const { footer, items, content } = measured;
        expect(measured.contentHeight, 'the page fits the window').toBeGreaterThan(
          measured.windowHeight,
        );
        expect(items).toHaveLength(3);
        const lines = new Set(items.map(item => Math.round(item.top))).size;
        expect(lines > 1, 'whether the items wrap').toBe(wraps);
        for (const item of items) {
          expect(item.top).toBeGreaterThanOrEqual(footer.top);
          expect(item.bottom).toBeLessThanOrEqual(footer.bottom);
          expect(item.left).toBeGreaterThanOrEqual(footer.left);
          expect(item.right).toBeLessThanOrEqual(footer.right);
        }
        expect(footer.bottom).toBeCloseTo(measured.windowHeight, 0);
        expect(content.bottom).toBeLessThanOrEqual(footer.top + 0.5);
        if (belowSm) {
          // No page text shows beside the footer.
          expect(footer.left).toBe(0);
          expect(footer.right).toBeCloseTo(measured.windowWidth, 0);
        } else {
          expect(footer.bottom - footer.top).toBe(48);
        }
      });
    });

    test.describe('on a page shorter than the window', () => {
      test.use({ viewport: { width, height: 3000 } });

      test('ends the page at the window’s bottom, with nothing to scroll', async ({
        page,
      }) => {
        await openDataset(page);
        const measured = await scrollToEndAndMeasure(page);
        expect(
          measured.contentHeight + (measured.footer.bottom - measured.footer.top),
          'the page fills the window',
        ).toBeLessThan(measured.windowHeight);
        expect(measured.documentHeight).toBe(measured.windowHeight);
        expect(measured.footer.bottom).toBeCloseTo(measured.windowHeight, 0);
      });
    });
  });
}
