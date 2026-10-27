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

test('loads Roboto from its own build, and nothing from Google Fonts', async ({
  page,
}) => {
  const fonts: Array<string> = [];
  page.on('request', request => {
    if (request.resourceType() === 'font') {
      fonts.push(new URL(request.url()).pathname);
    }
  });
  // Recorded and answered here, so a page that asks fails the test without reaching Google.
  const google: Array<string> = [];
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route => {
    google.push(route.request().url());
    return route.fulfill({ status: 204 });
  });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Search', exact: true })).toBeVisible();
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts]
      .filter(face => face.status === 'loaded')
      .map(face => `${face.family.replaceAll('"', '')} ${face.style}`);
  });
  expect(loaded).toContain('Roboto Variable normal');
  expect(fonts.length).toBeGreaterThan(0);
  for (const font of fonts) {
    expect(font).toMatch(
      /^\/assets\/roboto-[a-z-]+-wght-(normal|italic)-[\w-]+\.woff2$/,
    );
  }
  expect(google).toEqual([]);
});
