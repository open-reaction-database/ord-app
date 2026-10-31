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

const GOOGLE_TAG = 'https://www.googletagmanager.com/gtag/js?id=G-REEDLYB0ZJ';

/** A host that is not local, as the viewer is deployed. */
const DEPLOYED = 'https://viewer.example';

/**
 * Serves the local build at DEPLOYED, and returns every request made to Google, each
 * recorded and answered here so none reaches Google.
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

/** The commands the page handed the Google tag, each as the arguments it was called with. */
function handed(page: Page) {
  return page.evaluate(() =>
    ((globalThis as { dataLayer?: Array<IArguments> }).dataLayer ?? []).map(command => [
      ...command,
    ]),
  );
}

/** Checks the page sent nothing to Google and holds no Google tag's dataLayer. */
async function expectNothingSentToGoogle(page: Page, sent: Array<string>) {
  expect(sent).toEqual([]);
  expect(await page.evaluate(() => 'dataLayer' in globalThis)).toBe(false);
}

function banner(page: Page) {
  return page.getByRole('region', { name: 'Analytics' });
}

test.afterEach(async ({ page }) => {
  // The app's own requests may still be on their way through the routes above.
  await page.unrouteAll({ behavior: 'ignoreErrors' });
});

test('asks nothing and sends nothing to Google from a page served locally', async ({
  page,
}) => {
  const sent: Array<string> = [];
  await page.route(GOOGLE, route => {
    sent.push(route.request().url());
    return route.fulfill({ status: 204 });
  });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Search', exact: true })).toBeVisible();
  await expect(banner(page)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Analytics settings' })).toHaveCount(0);
  await expectNothingSentToGoogle(page, sent);
});

test('asks before loading the Google tag on a deployed host', async ({
  page,
  baseURL,
}) => {
  const sent = await serveDeployed(page, baseURL);
  await page.goto(`${DEPLOYED}/`);
  await expect(banner(page)).toContainText('May we use Google Analytics?');
  await expect(
    banner(page).getByRole('link', { name: 'Privacy notice' }),
  ).toHaveAttribute(
    'href',
    'https://docs.open-reaction-database.org/en/latest/site_privacy.html',
  );
  await expectNothingSentToGoogle(page, sent);
});

test('loads the Google tag once a visitor accepts, and on their next visit', async ({
  page,
  baseURL,
}) => {
  await serveDeployed(page, baseURL);
  await page.goto(`${DEPLOYED}/`);
  const tag = page.waitForRequest(GOOGLE);
  await banner(page).getByRole('button', { name: 'Accept' }).click();
  expect((await tag).url()).toBe(GOOGLE_TAG);
  await expect(banner(page)).toHaveCount(0);
  expect((await handed(page)).slice(0, 2)).toEqual([
    [
      'consent',
      'default',
      {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
      },
    ],
    ['consent', 'update', { analytics_storage: 'granted' }],
  ]);
  const again = page.waitForRequest(GOOGLE);
  await page.reload();
  expect((await again).url()).toBe(GOOGLE_TAG);
  await expect(page.getByRole('button', { name: 'Analytics settings' })).toBeVisible();
  await expect(banner(page)).toHaveCount(0);
});

test('loads nothing once a visitor declines, or on their next visit', async ({
  page,
  baseURL,
}) => {
  const sent = await serveDeployed(page, baseURL);
  await page.goto(`${DEPLOYED}/`);
  await banner(page).getByRole('button', { name: 'Decline' }).click();
  await expect(banner(page)).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Analytics settings' })).toBeVisible();
  await expect(banner(page)).toHaveCount(0);
  await expectNothingSentToGoogle(page, sent);
});

test('stops the Google tag and deletes its cookies when a visitor changes their mind', async ({
  page,
  baseURL,
}) => {
  await serveDeployed(page, baseURL);
  await page.context().addCookies([
    { name: '_ga', value: 'GA1.1.1.1', domain: '.viewer.example', path: '/' },
    { name: '_ga_REEDLYB0ZJ', value: 'GS1.1.1', domain: '.viewer.example', path: '/' },
    { name: 'other', value: '1', domain: '.viewer.example', path: '/' },
  ]);
  await page.goto(`${DEPLOYED}/`);
  const tag = page.waitForRequest(GOOGLE);
  await banner(page).getByRole('button', { name: 'Accept' }).click();
  await tag;
  await page.getByRole('button', { name: 'Analytics settings' }).click();
  await banner(page).getByRole('button', { name: 'Decline' }).click();
  await expect(banner(page)).toHaveCount(0);
  expect(
    await page.evaluate(
      () => (globalThis as Record<string, unknown>)['ga-disable-G-REEDLYB0ZJ'],
    ),
  ).toBe(true);
  expect((await handed(page)).at(-1)).toEqual([
    'consent',
    'update',
    { analytics_storage: 'denied' },
  ]);
  const cookies = await page.context().cookies(DEPLOYED);
  expect(cookies.map(cookie => cookie.name)).toEqual(['other']);
});

test('hands the Google tag no question or structure', async ({ page, baseURL }) => {
  await serveDeployed(page, baseURL);
  await page.goto(`${DEPLOYED}/`);
  await banner(page).getByRole('button', { name: 'Accept' }).click();
  await page.getByRole('textbox', { name: 'Question' }).fill('reactions that use');
  await page.getByRole('button', { name: 'Add a structure' }).click();
  await page.getByRole('textbox', { name: 'Structure @A' }).fill('CC(=O)Cl');
  await page.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(
    page.getByText('Three reactions use the structure you drew.'),
  ).toBeVisible();
  // The tag reads its commands from dataLayer, and reports the page's title and its
  // address without the fragment.
  const commands = JSON.stringify(await handed(page));
  expect(commands).toContain('G-REEDLYB0ZJ');
  const asked = /reactions that|reactions\+that|CC\(=O\)Cl|CC%28/;
  expect(commands).not.toMatch(asked);
  expect(await page.title()).not.toMatch(asked);
  expect(new URL(page.url()).search).toBe('');
});

test('sends nothing to Google from a visitor who has not chosen, through an ask', async ({
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

test('sends nothing to Google from a visitor who has not chosen, through a search', async ({
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
