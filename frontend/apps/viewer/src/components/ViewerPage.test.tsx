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
import { afterEach, describe, expect, it } from 'vitest';
import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderAt } from '#test/render.tsx';
import { DOCS_URL, EDITOR_URL, ViewerPage } from '#components/ViewerPage.tsx';

const WIDE = 1024;

/** Sets happy-dom's viewport width, which Mantine's visibleFrom and hiddenFrom answer to. */
function setViewportWidth(width: number) {
  (
    window as unknown as {
      happyDOM: { setViewport(viewport: { width: number }): void };
    }
  ).happyDOM.setViewport({ width });
}

function renderPage() {
  return renderAt('/', <ViewerPage breadcrumbs={[]}>content</ViewerPage>);
}

afterEach(() => {
  setViewportWidth(WIDE);
});

describe('ViewerPage', () => {
  it('links the viewer’s pages, the editor, and the docs in a row', () => {
    setViewportWidth(WIDE);
    const { getByRole, queryByRole } = renderPage();
    const navigation = within(getByRole('navigation', { name: 'Main' }));
    const link = (name: string) => navigation.getByRole('link', { name });
    expect(link('Browse')).toHaveAttribute('href', '/datasets');
    expect(link('Search')).toHaveAttribute('href', '/search');
    expect(link('Ask')).toHaveAttribute('href', '/ask');
    expect(link('Contribute')).toHaveAttribute('href', EDITOR_URL);
    expect(link('Docs')).toHaveAttribute('href', DOCS_URL);
    expect(link('About')).toHaveAttribute('href', '/about');
    expect(queryByRole('button', { name: 'Navigation menu' })).not.toBeInTheDocument();
  });

  it('links the logo to the front page', () => {
    const { getByRole } = renderPage();
    expect(getByRole('link', { name: 'Open Reaction Database logo' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('lists the same links in a menu on a narrow screen, instead of in a row', async () => {
    setViewportWidth(375);
    const user = userEvent.setup();
    const { getByRole, queryByRole } = renderPage();
    expect(queryByRole('link', { name: 'Browse' })).not.toBeInTheDocument();
    await user.click(getByRole('button', { name: 'Navigation menu' }));
    const item = (name: string) => getByRole('menuitem', { name });
    expect(item('Browse')).toHaveAttribute('href', '/datasets');
    expect(item('Search')).toHaveAttribute('href', '/search');
    expect(item('Ask')).toHaveAttribute('href', '/ask');
    expect(item('Contribute')).toHaveAttribute('href', EDITOR_URL);
    expect(item('Docs')).toHaveAttribute('href', DOCS_URL);
    expect(item('About')).toHaveAttribute('href', '/about');
  });

  it('renders its children', () => {
    const { getByText } = renderPage();
    expect(getByText('content')).toBeInTheDocument();
  });
});
