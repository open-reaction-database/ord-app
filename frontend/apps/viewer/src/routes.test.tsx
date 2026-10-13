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
import { describe, expect, it } from 'vitest';
import { renderAt } from '#test/render.tsx';
import { ViewerRoutes } from '#routes.tsx';

describe('ViewerRoutes', () => {
  it('shows About', () => {
    const { getByRole } = renderAt('/about', <ViewerRoutes />);
    expect(getByRole('heading', { name: 'About' })).toBeInTheDocument();
  });

  it('shows NotFound for a path no route takes', () => {
    const { getByRole } = renderAt('/nowhere', <ViewerRoutes />);
    expect(getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  // Each redirect replaces the path it left, so history holds one entry.
  it.each([
    ['/browse', '/'],
    ['/dataset/ord_dataset-01', '/datasets/ord_dataset-01'],
    ['/dataset/a%2Fb', '/datasets/a%2Fb'],
    ['/id/ord-0123', '/reactions/ord-0123'],
    ['/id/a%2Fb', '/reactions/a%2Fb'],
    [
      '/selected-set?reaction_id=ord-b&reaction_id=ord-a',
      '/reactions?id=ord-b&id=ord-a',
    ],
    ['/selected-set', '/reactions'],
  ])('redirects ord-interface’s %s to %s', (from, to) => {
    const { history } = renderAt(from, <ViewerRoutes />);
    expect(history).toEqual([to]);
  });
});
