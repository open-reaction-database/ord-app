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

const GOOGLE_TAG = 'https://www.googletagmanager.com/**';

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
  // The page is fetched from the local server but addressed by a host that is not local.
  const deployed = 'https://viewer.example';
  await page.route(`${deployed}/**`, async route => {
    const url = route
      .request()
      .url()
      .replace(deployed, baseURL ?? '');
    await route.fulfill({ response: await route.fetch({ url }) });
  });
  // Answered here, so no request reaches Google.
  await page.route(GOOGLE_TAG, route => route.fulfill({ status: 204 }));
  const tag = page.waitForRequest(GOOGLE_TAG);
  await page.goto(`${deployed}/`);
  expect((await tag).url()).toBe(
    'https://www.googletagmanager.com/gtag/js?id=G-REEDLYB0ZJ',
  );
  // The app's own requests may still be on their way through the routes above.
  await page.unrouteAll({ behavior: 'ignoreErrors' });
});
