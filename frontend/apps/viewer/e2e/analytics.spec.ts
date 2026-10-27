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

/** Every host the Google tag loads from or reports to. */
const GOOGLE = /googletagmanager\.com|google-analytics\.com|analytics\.google\.com/;

/** A host that is not local, as the viewer is deployed. */
const DEPLOYED = 'https://viewer.example';

/**
 * Serves the local build at DEPLOYED, and returns every request made to Google, each
 * recorded and answered here so a page that sends one fails its test without reaching
 * Google.
 */
async function serveDeployed(page: Page, baseURL: string | undefined) {
  await page.route(`${DEPLOYED}/**`, async route => {
    const url = route
      .request()
      .url()
      .replace(DEPLOYED, baseURL ?? '');
    await route.fulfill({ response: await route.fetch({ url }) });
  });
  const sent: Array<string> = [];
  await page.route(GOOGLE, route => {
    sent.push(route.request().url());
    return route.fulfill({ status: 204 });
  });
  return sent;
}

/** Checks the page sent nothing to Google and holds no Google tag's dataLayer. */
async function expectNothingSentToGoogle(page: Page, sent: Array<string>) {
  expect(sent).toEqual([]);
  expect(await page.evaluate(() => 'dataLayer' in globalThis)).toBe(false);
  // The app's own requests may still be on their way through the routes above.
  await page.unrouteAll({ behavior: 'ignoreErrors' });
}

test('sends nothing to Google from a deployed host, through an ask', async ({
  page,
  baseURL,
}) => {
  const sent = await serveDeployed(page, baseURL);
  await page.goto(`${DEPLOYED}/`);
  await page.getByRole('textbox', { name: 'Question' }).fill('reactions that use');
  await page.getByRole('button', { name: 'Add a structure' }).click();
  await page.getByRole('textbox', { name: 'Structure @A' }).fill('CC(=O)Cl');
  await page.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(
    page.getByText('Three reactions use the structure you drew.'),
  ).toBeVisible();
  await expectNothingSentToGoogle(page, sent);
});

test('sends nothing to Google from a deployed host, through a search', async ({
  page,
  baseURL,
}) => {
  const sent = await serveDeployed(page, baseURL);
  await page.goto(`${DEPLOYED}/search`);
  await page.getByRole('button', { name: 'Add a structure' }).click();
  await page.getByRole('textbox', { name: 'Structure 1' }).fill('CC(=O)Cl');
  await page.getByRole('textbox', { name: 'Dataset IDs' }).fill('ord_dataset-viewer01');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('heading', { name: '2 reactions' })).toBeVisible();
  await expectNothingSentToGoogle(page, sent);
});

test('hands the Google tag no search on a deployed host', async ({ page, baseURL }) => {
  await serveDeployed(page, baseURL);
  await page.goto(`${DEPLOYED}/search`);
  await page.getByRole('button', { name: 'Add a structure' }).click();
  await page.getByRole('textbox', { name: 'Structure 1' }).fill('CC(=O)Cl');
  await page.getByRole('textbox', { name: 'Dataset IDs' }).fill('ord_dataset-viewer01');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('heading', { name: '2 reactions' })).toBeVisible();
  // The tag reads its commands from dataLayer, and reports the page's title and its
  // address without the fragment.
  const handed = await page.evaluate(() =>
    JSON.stringify((globalThis as { dataLayer?: unknown }).dataLayer),
  );
  expect(handed).toContain('G-REEDLYB0ZJ');
  const searched = /component|dataset_id|ord_dataset-viewer01|CC\(=O\)Cl|CC%28/;
  expect(handed).not.toMatch(searched);
  expect(await page.title()).not.toMatch(searched);
  expect(new URL(page.url()).search).toBe('');
  await page.unrouteAll({ behavior: 'ignoreErrors' });
});
