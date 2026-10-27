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
import { expect, it, vi } from 'vitest';

const { loadAnalytics, render } = vi.hoisted(() => ({
  loadAnalytics: vi.fn(),
  render: vi.fn(),
}));

vi.mock('@open-reaction-database/ui/shell', () => ({ loadAnalytics }));
vi.mock('react-dom/client', () => ({ createRoot: () => ({ render }) }));
vi.mock('./core/AppRoot.tsx', () => ({ AppRoot: () => null }));

it('names the editor’s Google tag, then renders the app', async () => {
  document.body.innerHTML = '<div id="root"></div>';
  await import('./main.tsx');
  expect(loadAnalytics).toHaveBeenCalledWith('G-R9MFY2X2C7');
  expect(render).toHaveBeenCalledTimes(1);
});
