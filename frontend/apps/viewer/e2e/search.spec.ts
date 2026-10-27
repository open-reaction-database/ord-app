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
  await page.goto(`/search#${new URLSearchParams([...params, ['limit', '100']])}`);
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
      ['ord-viewer0202'],
    );
    await expectResults(
      page,
      [
        ['min_conversion', '50'],
        ['max_conversion', '100'],
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
    await expectResults(page, [['doi', '10.1021/viewer0202']], ['ord-viewer0202']);
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

test('puts a search in no address the browser sends', async ({ page }) => {
  // Each request's address and Referer, which a server's access log records.
  const sent: Array<string> = [];
  page.on('request', request => {
    sent.push(`${request.url()} ${request.headers().referer ?? ''}`);
  });
  await page.goto('/search');
  await page.getByRole('button', { name: 'Add a structure' }).click();
  await page.getByRole('textbox', { name: 'Structure 1' }).fill('CC(=O)Cl');
  await page.getByRole('textbox', { name: 'Dataset IDs' }).fill('ord_dataset-viewer01');
  await page.getByRole('button', { name: 'Search' }).click();
  const found = page.getByRole('link', { name: REACTION_LINK });
  await expect(found).toHaveText(['ord-viewer0102', 'ord-viewer0103']);
  // The Google tag reports the page's address without its fragment.
  expect(new URL(page.url()).search).toBe('');
  // A reload requests the search page's own address.
  await page.reload();
  await expect(found).toHaveText(['ord-viewer0102', 'ord-viewer0103']);
  expect(sent.some(address => address.includes('/search'))).toBe(true);
  expect(
    sent.filter(address => /[?&](component|dataset_id)=|CC%28/.test(address)),
  ).toEqual([]);
});

test('opens the drawing dialog', async ({ page }) => {
  await page.goto('/search');
  await page.getByRole('button', { name: 'Add a structure' }).click();
  await page.getByRole('button', { name: 'Draw structure 1' }).click();
  await expect(page.locator('.Ketcher-root')).toBeVisible({ timeout: 30_000 });
});

// Ketcher sets this global to each instance it initializes.
interface KetcherWindow {
  ketcher?: { editor: { struct(): { atoms: { size: number } } } } | null;
}

/** Types a pattern, opens it in Ketcher, which draws it as written, and saves the drawing. */
async function redraw(page: Page, pattern: string, mode: string) {
  await page.goto('/search');
  await page.getByRole('button', { name: 'Add a structure' }).click();
  await page.getByRole('textbox', { name: 'Structure 1' }).fill(pattern);
  await page
    .getByRole('combobox', { name: 'Match for structure 1' })
    .selectOption(mode);
  await page.getByRole('button', { name: 'Draw structure 1' }).click();
  await page.waitForFunction(
    () => ((globalThis as KetcherWindow).ketcher?.editor.struct().atoms.size ?? 0) > 0,
    undefined,
    { timeout: 60_000 },
  );
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}

test.describe('a drawn Kekulé ring is saved aromatized', () => {
  // ord-viewer0101 holds the only aromatic rings in the corpus, a benzene and a pyridine.
  for (const [notation, ring, pattern, mode, saved] of [
    ['SMILES', 'benzene', 'C1=CC=CC=C1', 'substructure', 'c1ccccc1'],
    ['SMARTS', 'pyridine', 'C1=CC=NC=C1', 'smarts', '[#6]1:[#6]:[#6]:[#7]:[#6]:[#6]:1'],
  ] as const) {
    test(`as ${notation}, and finds the ${ring} ring`, async ({ page }) => {
      await redraw(page, pattern, mode);
      await expect(page.getByRole('textbox', { name: 'Structure 1' })).toHaveValue(
        saved,
      );
      await page.getByRole('button', { name: 'Search' }).click();
      await expect(page.getByRole('link', { name: REACTION_LINK })).toHaveText([
        'ord-viewer0101',
      ]);
    });
  }

  test('by the model that aromatizes a 2-pyridone, as RDKit does', async ({ page }) => {
    await redraw(page, 'O=C1C=CC=CN1', 'smarts');
    await expect(page.getByRole('textbox', { name: 'Structure 1' })).toHaveValue(
      '[#8]=[#6]1:[#7;H]:[#6]:[#6]:[#6]:[#6]:1',
    );
  });
});

test('says why a drawing has no SMILES, on a phone with Save still in view', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  // An atom list is SMARTS only, so a substructure, which asks for SMILES, cannot hold it.
  await redraw(page, '[#6]1-[#6]=[#6]-[#6]=[#6]-[#6,#7]=1', 'substructure');
  const alert = page.getByRole('alert');
  await expect(alert).toHaveText(/^The drawing could not be saved: .*atom list/);
  await expect(alert).toBeInViewport({ ratio: 1 });
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeInViewport({
    ratio: 1,
  });
  await expect(page.getByRole('textbox', { name: 'Structure 1' })).toHaveValue(
    '[#6]1-[#6]=[#6]-[#6]=[#6]-[#6,#7]=1',
  );
});

const SCREENS = [
  ['a phone', { width: 375, height: 812 }],
  ['a desktop', { width: 1280, height: 720 }],
] as const;

/** Opens the drawing dialog for structure 1, holding a pattern if one is given. */
async function openDrawing(page: Page, pattern?: string) {
  await page.goto('/search');
  await page.getByRole('button', { name: 'Add a structure' }).click();
  if (pattern !== undefined) {
    await page.getByRole('textbox', { name: 'Structure 1' }).fill(pattern);
  }
  await page.getByRole('button', { name: 'Draw structure 1' }).click();
  await expect(page.locator('.Ketcher-root')).toBeVisible({ timeout: 30_000 });
}

for (const [screen, viewport] of SCREENS) {
  test(`keeps Cancel and Save whole inside the drawing dialog on ${screen}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await openDrawing(page);
    const dialog = (await page.getByRole('dialog').boundingBox())!;
    for (const name of ['Cancel', 'Save']) {
      const button = page.getByRole('button', { name, exact: true });
      const box = (await button.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(dialog.x);
      expect(box.y).toBeGreaterThanOrEqual(dialog.y);
      expect(box.x + box.width).toBeLessThanOrEqual(dialog.x + dialog.width);
      expect(box.y + box.height).toBeLessThanOrEqual(dialog.y + dialog.height);
      // A squeezed button keeps its box and cuts its label short.
      const clipped = await button.evaluate(element =>
        [element, ...element.querySelectorAll('*')].some(
          inner => inner.scrollWidth > inner.clientWidth,
        ),
      );
      expect(clipped, `${name}'s label is cut short`).toBe(false);
    }
  });

  test(`says why a pattern cannot be drawn on ${screen}, and keeps it`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await openDrawing(page, 'not a smiles');
    const alert = page.getByRole('alert');
    await expect(alert).toContainText('The structure could not be loaded.', {
      timeout: 60_000,
    });
    await expect(alert).toContainText('SMILES loader: invalid character');
    await expect(
      page.getByRole('button', { name: 'Save', exact: true }),
    ).toBeDisabled();
    // Ketcher's buttons stay in reach, to draw the structure that replaces the pattern.
    const covered = await alert.evaluate(card =>
      [...document.querySelectorAll('.Ketcher-root button')]
        .filter(button => {
          const box = button.getBoundingClientRect();
          const hit = document.elementFromPoint(
            box.left + box.width / 2,
            box.top + box.height / 2,
          );
          return box.width > 0 && hit !== null && card.contains(hit);
        })
        .map(button => button.getAttribute('data-testid') ?? button.outerHTML),
    );
    expect(covered).toEqual([]);
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('textbox', { name: 'Structure 1' })).toHaveValue(
      'not a smiles',
    );
  });
}

test('saves a drawing over a pattern that cannot be drawn', async ({ page }) => {
  await openDrawing(page, 'not a smiles');
  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible({ timeout: 60_000 });
  // A benzene ring, placed beside the message rather than under it.
  await page.getByTestId('template-0').click();
  await page.getByTestId('canvas').click({ position: { x: 100, y: 300 } });
  await expect(alert).toBeHidden();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Structure 1' })).toHaveValue(
    'c1ccccc1',
  );
});
