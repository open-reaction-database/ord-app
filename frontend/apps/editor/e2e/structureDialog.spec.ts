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
import { seedReaction } from './seed.ts';

// Ketcher sets this global once its canvas is ready.
interface KetcherWindow {
  ketcher?: { setMolecule(structure: string): Promise<void> } | null;
}

test('draws a molblock identifier in Ketcher and saves it', async ({
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
  await page.getByText('Add Molblock Identifier').click();
  await page.waitForFunction(
    () => Boolean((globalThis as KetcherWindow).ketcher),
    undefined,
    {
      timeout: 60_000,
    },
  );
  await page.evaluate(() => (globalThis as KetcherWindow).ketcher?.setMolecule('CCO'));
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(page.getByText('Drawn with Ketcher')).toBeVisible();
});
