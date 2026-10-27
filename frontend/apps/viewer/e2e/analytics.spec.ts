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

const GOOGLE_TAG = 'https://www.googletagmanager.com/**';

/** A host that is not local, where the viewer loads the Google tag. */
const DEPLOYED = 'https://viewer.example';

/** Serves the local build at DEPLOYED, and answers the Google tag here. */
async function serveDeployed(page: Page, baseURL: string | undefined) {
  await page.route(`${DEPLOYED}/**`, async route => {
    const url = route
      .request()
      .url()
      .replace(DEPLOYED, baseURL ?? '');
    await route.fulfill({ response: await route.fetch({ url }) });
  });
  // Answered here, so no request reaches Google.
  await page.route(GOOGLE_TAG, route => route.fulfill({ status: 204 }));
}

test('sends nothing to Google from a page served locally', async ({ page }) => {
  const sent: Array<string> = [];
  // Recorded and answered here, so a page that asks fails the test without reaching Google.
  await page.route(GOOGLE_TAG, route => {
    sent.push(route.request().url());
    return route.fulfill({ status: 204 });
  });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Search', exact: true })).toBeVisible();
  expect(sent).toEqual([]);
});

test('loads the Google tag on a deployed host', async ({ page, baseURL }) => {
  await serveDeployed(page, baseURL);
  const tag = page.waitForRequest(GOOGLE_TAG);
  await page.goto(`${DEPLOYED}/`);
  expect((await tag).url()).toBe(
    'https://www.googletagmanager.com/gtag/js?id=G-REEDLYB0ZJ',
  );
  // The app's own requests may still be on their way through the routes above.
  await page.unrouteAll({ behavior: 'ignoreErrors' });
});

test('hands the Google tag no question or structure on a deployed host', async ({
  page,
  baseURL,
}) => {
  await serveDeployed(page, baseURL);
  await page.goto(`${DEPLOYED}/`);
  await page.getByRole('textbox', { name: 'Question' }).fill('reactions that use');
  await page.getByRole('button', { name: 'Add a structure' }).click();
  await page.getByRole('textbox', { name: 'Structure @A' }).fill('CC(=O)Cl');
  await page.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(
    page.getByText('Three reactions use the structure you drew.'),
  ).toBeVisible();
  // The tag reads its commands from dataLayer, and reports the page's title and its
  // address without the fragment.
  const handed = await page.evaluate(() =>
    JSON.stringify((globalThis as { dataLayer?: unknown }).dataLayer),
  );
  expect(handed).toContain('G-REEDLYB0ZJ');
  const asked = /reactions that|reactions\+that|CC\(=O\)Cl|CC%28/;
  expect(handed).not.toMatch(asked);
  expect(await page.title()).not.toMatch(asked);
  expect(new URL(page.url()).search).toBe('');
  await page.unrouteAll({ behavior: 'ignoreErrors' });
});
