/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, it, expect } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { renderWithMantine } from '#testing/renderWithMantine.tsx';
import type { Breadcrumbs as BreadcrumbItems } from '#shell/breadcrumbs.ts';
import { Breadcrumbs } from './Breadcrumbs.tsx';

/** Renders the crumbs as the editor does: inside a route nested at /datasets. */
function renderNested(items: BreadcrumbItems) {
  const location = memoryLocation({ path: '/datasets/1', record: true });
  renderWithMantine(
    <Router hook={location.hook}>
      <Router base="/datasets">
        <Breadcrumbs items={items} />
      </Router>
    </Router>,
  );
  return location.history!;
}

describe('Breadcrumbs', () => {
  it('renders a link for each non-active crumb and plain text for the active one', () => {
    renderWithMantine(
      <Breadcrumbs
        items={[
          { title: 'Datasets', path: '/datasets' },
          { title: 'My Dataset', path: '/datasets/1' },
        ]}
      />,
    );
    expect(screen.getByText('Datasets')).toBeInTheDocument();
    expect(screen.getByText('My Dataset')).toBeInTheDocument();
    // The first (non-active) crumb is a link; the last (active) one is not.
    expect(screen.getByRole('link', { name: 'Datasets' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'My Dataset' })).not.toBeInTheDocument();
  });

  it('links each crumb to its path within the enclosing route, with ~ for the app root', () => {
    renderNested([
      { title: 'Datasets', path: '~/' },
      { title: 'Reactions', path: '/1/reactions' },
      { title: 'Reaction', path: '/1/reactions/2' },
    ]);
    expect(screen.getByRole('link', { name: 'Datasets' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Reactions' })).toHaveAttribute(
      'href',
      '/datasets/1/reactions',
    );
  });

  it('navigates once, to the first crumb’s page, from the Home icon', () => {
    const history = renderNested([
      { title: 'Datasets', path: '~/' },
      { title: 'My Dataset', path: '/1' },
    ]);
    const homeIcon = screen
      .getByRole('link', { name: 'Datasets' })
      .querySelector('svg') as SVGElement;
    fireEvent.click(homeIcon);
    expect(history).toEqual(['/datasets/1', '/']);
  });

  it('stays put when the Home icon is on the current page', () => {
    const history = renderNested([{ title: 'Datasets', path: '~/' }]);
    fireEvent.click(screen.getByText('Datasets').parentElement!.querySelector('svg')!);
    expect(history).toEqual(['/datasets/1']);
  });
});
