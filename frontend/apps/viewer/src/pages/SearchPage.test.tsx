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
import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderAt } from '#test/render.tsx';
import { mockApi } from '#test/fetch.ts';
import { VIEWER0103 } from '#test/fixtures/records.ts';
import { SearchPage } from '#pages/SearchPage.tsx';

vi.mock('@open-reaction-database/ui/ketcher', () => ({ StructureDialog: () => null }));

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('SearchPage', () => {
  it('asks for criteria before searching', () => {
    const fetch = mockApi({});
    const { getByText } = renderAt('/search', <SearchPage />);
    expect(
      getByText('Set a structure, a reaction SMARTS, a range, or an ID, then search.'),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("runs the URL's search and shows its reactions", async () => {
    const fetch = mockApi({
      'POST /api/search': {
        kind: 'reactions',
        reaction_ids: ['ord-viewer0103'],
        truncated: false,
      },
      'GET /api/reactions': [VIEWER0103],
    });
    const { findByRole } = renderAt(
      '/search?reaction_id=ord-viewer0103&limit=100',
      <SearchPage />,
    );
    expect(await findByRole('link', { name: 'ord-viewer0103' })).toBeInTheDocument();
    const body = JSON.parse(String(fetch.mock.calls[0][1]?.body));
    expect(body.query.where.clauses[0].value.literal).toBe('ord-viewer0103');
  });

  it("says when the search stopped at the URL's limit", async () => {
    mockApi({
      'POST /api/search': {
        kind: 'reactions',
        reaction_ids: ['ord-viewer0103'],
        truncated: false,
      },
      'GET /api/reactions': [VIEWER0103],
    });
    const { findByText } = renderAt(
      '/search?reaction_id=ord-viewer0103&limit=1',
      <SearchPage />,
    );
    expect(await findByText(/stopped at its limit of 1;/)).toBeInTheDocument();
  });

  it('shows a table the search answers with', async () => {
    mockApi({
      'POST /api/search': {
        kind: 'table',
        columns: ['n'],
        rows: [[3]],
        truncated: false,
      },
    });
    const { findByRole } = renderAt(
      '/search?reaction_id=ord-viewer0103&limit=100',
      <SearchPage />,
    );
    expect(await findByRole('columnheader', { name: 'n' })).toBeInTheDocument();
  });

  it('hides and shows the form', async () => {
    const user = userEvent.setup();
    const { getByRole, queryByRole } = renderAt('/search', <SearchPage />);
    await user.click(getByRole('button', { name: 'Hide the form' }));
    expect(queryByRole('button', { name: 'Search' })).not.toBeInTheDocument();
    await user.click(getByRole('button', { name: 'Show the form' }));
    expect(getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('keeps unsent edits while the form is hidden', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderAt('/search', <SearchPage />);
    await user.click(getByRole('button', { name: 'Add a structure' }));
    await user.type(getByRole('textbox', { name: 'Structure 1' }), 'CCN');
    await user.click(getByRole('button', { name: 'Hide the form' }));
    await user.click(getByRole('button', { name: 'Show the form' }));
    expect(getByRole('textbox', { name: 'Structure 1' })).toHaveValue('CCN');
  });

  it('puts a new search in the URL', async () => {
    mockApi({});
    const user = userEvent.setup();
    const { getByRole, history } = renderAt('/search', <SearchPage />);
    await user.click(getByRole('button', { name: 'Add a structure' }));
    await user.type(getByRole('textbox', { name: 'Structure 1' }), 'CCN');
    await user.click(getByRole('button', { name: 'Search' }));
    const params = new URLSearchParams(history.at(-1)!.split('?')[1]);
    expect(JSON.parse(params.get('component')!)).toEqual({
      pattern: 'CCN',
      target: 'input',
      mode: 'exact',
    });
  });

  it("shows the server's reason for a search it refused", async () => {
    mockApi({
      'POST /api/search': () =>
        new Response(JSON.stringify({ detail: 'cannot parse SMARTS "C(("' }), {
          status: 422,
        }),
    });
    const { findByRole } = renderAt(
      `/search?component=${encodeURIComponent('C((;input;smarts')}&limit=100`,
      <SearchPage />,
    );
    expect(await findByRole('alert')).toHaveTextContent('cannot parse SMARTS');
  });

  it('notes where answers differ from the old site', () => {
    const { getByText, queryByRole } = renderAt('/search', <SearchPage />);
    expect(getByText(/returns fewer reactions than the old site/)).toBeInTheDocument();
    // A note read at leisure, not an alert announced as the page loads.
    expect(queryByRole('alert')).not.toBeInTheDocument();
  });
});
