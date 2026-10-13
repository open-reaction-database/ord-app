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
import { within } from '@testing-library/react';
import { renderAt } from '#test/render.tsx';
import { DOCS_URL, EDITOR_URL, ViewerPage } from '#components/ViewerPage.tsx';

describe('ViewerPage', () => {
  it('links the viewer’s pages, the editor, and the docs, but not /ask', () => {
    const { getByRole, queryByRole } = renderAt(
      '/',
      <ViewerPage breadcrumbs={[]}>content</ViewerPage>,
    );
    const navigation = within(getByRole('navigation', { name: 'Main' }));
    const link = (name: string) => navigation.getByRole('link', { name });
    expect(link('Browse')).toHaveAttribute('href', '/');
    expect(link('Search')).toHaveAttribute('href', '/search');
    expect(link('Contribute')).toHaveAttribute('href', EDITOR_URL);
    expect(link('Docs')).toHaveAttribute('href', DOCS_URL);
    expect(link('About')).toHaveAttribute('href', '/about');
    expect(queryByRole('link', { name: /ask/i })).not.toBeInTheDocument();
  });

  it('renders its children', () => {
    const { getByText } = renderAt(
      '/',
      <ViewerPage breadcrumbs={[]}>content</ViewerPage>,
    );
    expect(getByText('content')).toBeInTheDocument();
  });
});
