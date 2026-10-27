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

/** Every host the Google tag loads from or reports to. */
const GOOGLE = /googletagmanager\.com|google-analytics\.com|analytics\.google\.com/;

/** A host that is not local, as the viewer is deployed. */
const DEPLOYED = 'https://viewer.example';

test('sends nothing to Google from a deployed host, through an ask', async ({
  page,
  baseURL,
}) => {
  // The page is fetched from the local server but addressed by a host that is not local.
  await page.route(`${DEPLOYED}/**`, async route => {
    const url = route
      .request()
      .url()
      .replace(DEPLOYED, baseURL ?? '');
    await route.fulfill({ response: await route.fetch({ url }) });
  });
  const sent: Array<string> = [];
  // Recorded and answered here, so a page that asks fails the test without reaching Google.
  await page.route(GOOGLE, route => {
    sent.push(route.request().url());
    return route.fulfill({ status: 204 });
  });
  await page.goto(`${DEPLOYED}/`);
  await page.getByRole('textbox', { name: 'Question' }).fill('reactions that use');
  await page.getByRole('button', { name: 'Add a structure' }).click();
  await page.getByRole('textbox', { name: 'Structure @A' }).fill('CC(=O)Cl');
  await page.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(
    page.getByText('Three reactions use the structure you drew.'),
  ).toBeVisible();
  expect(sent).toEqual([]);
  expect(await page.evaluate(() => 'dataLayer' in globalThis)).toBe(false);
  // The app's own requests may still be on their way through the routes above.
  await page.unrouteAll({ behavior: 'ignoreErrors' });
});
