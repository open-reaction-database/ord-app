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
import { test, expect } from '@playwright/test';

// Smoke test for the no-auth dev/E2E bypass: with VITE_E2E_NO_AUTH set (frontend) and the
// backend e2e mode enabled, the app must load without redirecting to Auth0 and render the
// authenticated shell. Reaching the Datasets page proves the dev user was provisioned.
test('loads the authenticated app without Auth0 and shows the Datasets page', async ({ page }) => {
  // 'load' may not fire reliably for this WASM-heavy app; domcontentloaded is enough to start it.
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // "/" redirects to "/datasets" (client-side, after the dev user is provisioned) — and
  // crucially we stay on the app, never the Auth0 domain.
  await expect(page).toHaveURL(/\/datasets/, { timeout: 30_000 });

  // The Datasets list heading only renders once the dev user has been provisioned.
  await expect(page.getByRole('heading', { name: 'Datasets', level: 1 })).toBeVisible({ timeout: 30_000 });
});
