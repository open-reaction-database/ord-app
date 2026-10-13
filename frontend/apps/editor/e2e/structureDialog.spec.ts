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

// Ketcher sets this global to each instance it initializes.
interface KetcherWindow {
  ketcher?: {
    setMolecule(structure: string): Promise<void>;
    getSmiles(): Promise<string>;
  } | null;
}

/** Waits for a Ketcher initialized after the global was last cleared. */
async function waitForKetcher(page: Page) {
  await page.waitForFunction(
    () => Boolean((globalThis as KetcherWindow).ketcher),
    undefined,
    {
      timeout: 60_000,
    },
  );
}

function drawnSmiles(page: Page): Promise<string | undefined> {
  return page.evaluate(() => (globalThis as KetcherWindow).ketcher?.getSmiles());
}

test('draws a molblock identifier in Ketcher and saves the drawing', async ({
  page,
  request,
}) => {
  // Its own reaction, since saving changes it.
  const { datasetId, reactionId } = await seedReaction(request);
  await page.goto(`/datasets/${datasetId}/reactions/${reactionId}`, {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.getByText('acid', { exact: true }).first()).toBeVisible({
    timeout: 30_000,
  });

  await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
  // The input's drawer lists its components; a component's own form holds its identifiers.
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Edit', exact: true })
    .first()
    .click();
  await page.getByText('Add Molblock Identifier').click();
  await waitForKetcher(page);
  // The dialog loads its initial structure into the canvas as Ketcher starts, so the
  // drawing is set until Ketcher reports it.
  await expect(async () => {
    await page.evaluate(() =>
      (globalThis as KetcherWindow).ketcher?.setMolecule('CCO'),
    );
    expect(await drawnSmiles(page)).toBe('CCO');
  }).toPass();
  // The drawer's form has a Save of its own; this one is the dialog holding Ketcher.
  const ketcherDialog = page
    .getByRole('dialog')
    .filter({ has: page.locator('.Ketcher-root') });
  await ketcherDialog.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(ketcherDialog).toBeHidden();

  // Reopen the saved identifier in a new Ketcher, which loads the stored molfile.
  await page.evaluate(() => {
    (globalThis as KetcherWindow).ketcher = null;
  });
  await page
    .locator('div')
    .filter({ hasText: 'Drawn with Ketcher' })
    .filter({ has: page.getByRole('button', { name: 'Edit', exact: true }) })
    .last()
    .getByRole('button', { name: 'Edit', exact: true })
    .click();
  await waitForKetcher(page);
  await expect.poll(() => drawnSmiles(page)).toBe('CCO');
});
