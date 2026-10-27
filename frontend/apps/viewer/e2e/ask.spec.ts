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

const REACTION_LINK = /^ord-viewer\d{4}$/;

test('answers a question with its reactions', async ({ page }) => {
  await page.goto('/ask');
  await page
    .getByRole('textbox', { name: 'Question' })
    .fill('reactions that use acetyl chloride');
  await page.getByRole('button', { name: 'Ask' }).click();
  await expect(page.getByText('Three reactions use acetyl chloride.')).toBeVisible();
  await expect(page.getByRole('link', { name: REACTION_LINK })).toHaveText([
    'ord-viewer0102',
    'ord-viewer0103',
    'ord-viewer0201',
  ]);
  await page.getByRole('button', { name: 'The query it ran' }).click();
  await expect(page.getByText('"same_compound"', { exact: false })).toBeVisible();
});

test('answers a question with a table', async ({ page }) => {
  await page.goto(
    `/ask#${new URLSearchParams({ q: 'how many reactions are in each dataset' })}`,
  );
  const table = page.getByRole('table');
  await expect(table).toContainText('ord_dataset-viewer01');
  await expect(table).toContainText('3');
});

test('says why it cannot answer a question', async ({ page }) => {
  await page.goto(`/ask#${new URLSearchParams({ q: 'what does pyridine cost' })}`);
  await expect(page.getByRole('alert')).toContainText('no script');
});

test('answers a question about a structure pasted beside it', async ({ page }) => {
  await page.goto('/ask');
  const question = page.getByRole('textbox', { name: 'Question' });
  await question.fill('reactions that use');
  await page.getByRole('button', { name: 'Add a structure' }).click();
  await expect(question).toHaveValue('reactions that use @A');
  await page.getByRole('textbox', { name: 'Structure @A' }).fill('CC(=O)Cl');
  await page.getByRole('button', { name: 'Ask' }).click();
  await expect(page).toHaveURL(/%40A=CC%28%3DO%29Cl/);
  await expect(
    page.getByText('Three reactions use the structure you drew.'),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: REACTION_LINK })).toHaveText([
    'ord-viewer0102',
    'ord-viewer0103',
    'ord-viewer0201',
  ]);
  // The query that ran names the structure itself, not its placeholder.
  await page.getByRole('button', { name: 'The query it ran' }).click();
  await expect(page.getByText('"CC(=O)Cl"', { exact: false })).toBeVisible();
});

test('puts a question and its structures in no address the browser sends', async ({
  page,
}) => {
  // Each request's address and Referer, which a server's access log records.
  const sent: Array<string> = [];
  page.on('request', request => {
    sent.push(`${request.url()} ${request.headers().referer ?? ''}`);
  });
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Question' }).fill('reactions that use');
  await page.getByRole('button', { name: 'Add a structure' }).click();
  await page.getByRole('textbox', { name: 'Structure @A' }).fill('CC(=O)Cl');
  await page.getByRole('button', { name: 'Ask' }).click();
  const answer = page.getByText('Three reactions use the structure you drew.');
  await expect(answer).toBeVisible();
  // The Google tag reports the page's address without its fragment.
  expect(new URL(page.url()).search).toBe('');
  // A reload requests the ask page's own address.
  await page.reload();
  await expect(answer).toBeVisible();
  expect(sent.some(address => address.includes('/ask'))).toBe(true);
  expect(sent.filter(address => /reactions\+that|CC%28/.test(address))).toEqual([]);
});

// Ketcher sets this global to each instance it initializes.
interface KetcherWindow {
  ketcher?: { editor: { struct(): { atoms: { size: number } } } } | null;
}

async function drawWhatTheFieldHolds(page: Page) {
  await page.getByRole('button', { name: 'Draw @A' }).click();
  await page.waitForFunction(
    () => ((globalThis as KetcherWindow).ketcher?.editor.struct().atoms.size ?? 0) > 0,
    undefined,
    { timeout: 60_000 },
  );
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}

test('draws a structure into its field, saved as aromatized SMILES', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add a structure' }).click();
  const field = page.getByRole('textbox', { name: 'Structure @A' });
  await field.fill('C1=CC=CC=C1');
  await drawWhatTheFieldHolds(page);
  await expect(field).toHaveValue('c1ccccc1');
});
