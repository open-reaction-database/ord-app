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
import { expect, type Page } from '@playwright/test';

export const PREVIEW = 'img[src^="data:image/svg+xml"]';
export const LOADER = '.mantine-Loader-root';

/** Waits for what the reaction page loads after the reaction itself, so a check sees it all. */
export async function waitForReactionPageToSettle(page: Page) {
  // Edit controls appear once the dataset loads and grants the dev user edit rights.
  await expect(page.getByRole('button', { name: 'Remove', exact: true })).toBeVisible();
  // The user menu appears once the signed-in user loads.
  await expect(page.getByText('E2E User', { exact: true })).toBeVisible();
  // The Indigo worker renders the molecule previews: three in the header and two in the
  // inputs list.
  await expect(page.locator(LOADER)).toHaveCount(0);
  await expect(page.locator(PREVIEW).filter({ visible: true })).toHaveCount(5);
}
