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

function component(pattern: string, target: string, mode: string): [string, string] {
  return ['component', JSON.stringify({ pattern, target, mode })];
}

async function expectResults(
  page: Page,
  params: Array<[string, string]>,
  ids: Array<string>,
) {
  await page.goto(`/search?${new URLSearchParams([...params, ['limit', '100']])}`);
  if (ids.length === 0) {
    await expect(page.getByText('No reactions.')).toBeVisible();
  } else {
    await expect(page.getByRole('link', { name: REACTION_LINK })).toHaveText(ids);
  }
}

test.describe('each field searches the corpus', () => {
  test('an exact input', async ({ page }) => {
    await expectResults(
      page,
      [component('CC(=O)Cl', 'input', 'exact')],
      ['ord-viewer0102', 'ord-viewer0103', 'ord-viewer0201'],
    );
  });

  test('a similar input', async ({ page }) => {
    await expectResults(
      page,
      [component('CCN', 'input', 'similar'), ['similarity', '0.5']],
      ['ord-viewer0103'],
    );
  });

  test('a substructure input', async ({ page }) => {
    await expectResults(
      page,
      [component('C(=O)Cl', 'input', 'substructure')],
      ['ord-viewer0102', 'ord-viewer0103', 'ord-viewer0201'],
    );
  });

  test('a SMARTS product, with and without stereochemistry', async ({ page }) => {
    const smarts = component('C[C@@H](N)C(=O)O', 'output', 'smarts');
    await expectResults(
      page,
      [smarts, ['use_stereochemistry', 'true']],
      ['ord-viewer0102'],
    );
    await expectResults(
      page,
      [smarts, ['use_stereochemistry', 'false']],
      ['ord-viewer0102', 'ord-viewer0201'],
    );
  });

  test('a reaction SMARTS', async ({ page }) => {
    await expectResults(
      page,
      [['reaction_smarts', '[NX3:1].[CX3:2](=O)Cl>>[N:1][C:2]=O']],
      ['ord-viewer0102', 'ord-viewer0103', 'ord-viewer0201'],
    );
  });

  test('a yield range', async ({ page }) => {
    await expectResults(
      page,
      [
        ['min_yield', '70'],
        ['max_yield', '100'],
      ],
      ['ord-viewer0102', 'ord-viewer0103'],
    );
  });

  test('a conversion range', async ({ page }) => {
    await expectResults(
      page,
      [
        ['min_conversion', '0'],
        ['max_conversion', '50'],
      ],
      [],
    );
  });

  test('a dataset ID', async ({ page }) => {
    await expectResults(
      page,
      [['dataset_id', 'ord_dataset-viewer02']],
      ['ord-viewer0201', 'ord-viewer0202'],
    );
  });

  test('a DOI', async ({ page }) => {
    await expectResults(page, [['doi', '10.1/x']], []);
  });

  test('a reaction ID', async ({ page }) => {
    await expectResults(page, [['reaction_id', 'ord-viewer0103']], ['ord-viewer0103']);
  });

  test("ord-interface's legacy component", async ({ page }) => {
    await expectResults(
      page,
      [['component', 'CC(=O)Cl;input;exact']],
      ['ord-viewer0102', 'ord-viewer0103', 'ord-viewer0201'],
    );
  });
});

test('searches from the form, and keeps a selection across Back', async ({ page }) => {
  await page.goto('/search');
  await page.getByRole('button', { name: 'Add a structure' }).click();
  await page.getByRole('textbox', { name: 'Structure 1' }).fill('CC(=O)Cl');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('link', { name: REACTION_LINK })).toHaveCount(3);
  await page.getByRole('checkbox', { name: 'Select ord-viewer0103' }).check();
  await page.getByRole('link', { name: 'View 1 selected' }).click();
  await expect(page).toHaveURL('/reactions?id=ord-viewer0103');
  await page.goBack();
  await expect(
    page.getByRole('checkbox', { name: 'Select ord-viewer0103' }),
  ).toBeChecked();
});

test('opens the drawing dialog', async ({ page }) => {
  await page.goto('/search');
  await page.getByRole('button', { name: 'Add a structure' }).click();
  await page.getByRole('button', { name: 'Draw structure 1' }).click();
  await expect(page.locator('.Ketcher-root')).toBeVisible({ timeout: 30_000 });
});
