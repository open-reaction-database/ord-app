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
import { CompoundIdentifier_CompoundIdentifierType as IdentifierType } from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb.js';
import { expect, test } from '@playwright/test';
import { readReaction, seedReaction } from './seed.ts';

test('saves a CXSMILES identifier from Ketcher with its stereo group', async ({
  page,
  request,
}) => {
  const seeded = await seedReaction(request, 'cxsmilesReaction.pbtxt');
  await page.goto(`/datasets/${seeded.datasetId}/reactions/${seeded.reactionId}`, {
    waitUntil: 'domcontentloaded',
  });
  // Component rows sit in the input's accordion panel.
  await page
    .locator('.mantine-Accordion-panel')
    .getByRole('button', { name: 'Edit', exact: true })
    .first()
    .click({ timeout: 30_000 });
  const drawer = page.getByRole('dialog');
  await expect(drawer.getByText('CXSMILES', { exact: true })).toBeVisible();
  await drawer.getByRole('button', { name: 'Edit', exact: true }).click();

  const editor = page
    .getByRole('dialog')
    .filter({ has: page.getByPlaceholder('Details') });
  // Ketcher labels the center once it has read the racemate's stereo group.
  await expect(editor.getByText('AND Enantiomer')).toBeVisible({ timeout: 30_000 });
  await editor.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Reaction updated.')).toBeVisible();

  const saved = await readReaction(request, seeded);
  const [identifier] = saved.inputs.alanine.components[0].identifiers;
  expect(identifier.type).toBe(IdentifierType.CXSMILES);
  expect(identifier.value).toContain('&1:1');
  expect(identifier.details).toBe('racemic alanine');
});
