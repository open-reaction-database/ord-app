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

test.beforeAll(async ({ request }) => {
  await seedReaction(request);
});

// A 1280 px window less the 16 px a classic scrollbar takes; headless Chromium draws none.
test.use({ viewport: { width: 1264, height: 1080 } });

test('shows each dataset’s download menu without scrolling the table', async ({
  page,
}) => {
  await page.goto('/datasets', { waitUntil: 'domcontentloaded' });
  const menu = page.getByRole('button', { name: 'Download dataset' }).first();
  await expect(menu).toBeVisible({ timeout: 30_000 });
  // The table scrolls in its own container, which clips what lies past its edge.
  await expect(menu).toBeInViewport({ ratio: 1 });
});
