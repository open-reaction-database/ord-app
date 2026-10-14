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
import { VIEWER0101, VIEWER0102 } from '#test/fixtures/records.ts';
import { ReactionResults } from '#components/ReactionResults.tsx';

const RESULT = {
  kind: 'reactions' as const,
  reaction_ids: ['ord-viewer0101', 'ord-viewer0102'],
  truncated: false,
};

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('ReactionResults', () => {
  it('counts the reactions and lists them', async () => {
    mockApi({ 'GET /api/reactions': [VIEWER0101, VIEWER0102] });
    const { findByRole, getByRole } = renderAt(
      '/search',
      <ReactionResults
        result={RESULT}
        selectionKey="k"
      />,
    );
    expect(getByRole('heading', { name: '2 reactions' })).toBeInTheDocument();
    expect(await findByRole('link', { name: 'ord-viewer0102' })).toBeInTheDocument();
  });

  it('views the selected reactions as a set', async () => {
    mockApi({ 'GET /api/reactions': [VIEWER0101, VIEWER0102] });
    const user = userEvent.setup();
    const { findByRole, getByRole } = renderAt(
      '/search',
      <ReactionResults
        result={RESULT}
        selectionKey="k"
      />,
    );
    await user.click(await findByRole('checkbox', { name: 'Select ord-viewer0102' }));
    await user.click(getByRole('checkbox', { name: 'Select ord-viewer0101' }));
    expect(getByRole('link', { name: 'View 2 selected' })).toHaveAttribute(
      'href',
      '/reactions?id=ord-viewer0102&id=ord-viewer0101',
    );
  });

  it('stops selecting at 100, saying why', async () => {
    sessionStorage.setItem(
      'viewer-selection:k',
      JSON.stringify(Array.from({ length: 100 }, (_, index) => `ord-${index}`)),
    );
    mockApi({ 'GET /api/reactions': [VIEWER0101, VIEWER0102] });
    const { findByRole } = renderAt(
      '/search',
      <ReactionResults
        result={RESULT}
        selectionKey="k"
      />,
    );
    const checkbox = await findByRole('checkbox', { name: 'Select ord-viewer0101' });
    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveAttribute('title', 'A set holds at most 100 reactions.');
  });

  it('offers no set to view before a reaction is selected', async () => {
    mockApi({ 'GET /api/reactions': [VIEWER0101, VIEWER0102] });
    const { findByRole, getByRole, queryByRole } = renderAt(
      '/search',
      <ReactionResults
        result={RESULT}
        selectionKey="k"
      />,
    );
    await findByRole('checkbox', { name: 'Select ord-viewer0101' });
    expect(queryByRole('link', { name: 'View 0 selected' })).not.toBeInTheDocument();
    expect(getByRole('button', { name: 'View 0 selected' })).toBeDisabled();
  });

  it("says when the search stopped at the form's limit", () => {
    mockApi({ 'GET /api/reactions': [] });
    const { getByText } = renderAt(
      '/search',
      <ReactionResults
        result={RESULT}
        selectionKey="k"
        limit={2}
      />,
    );
    expect(
      getByText(/stopped at its limit of 2; raise the limit to see more/),
    ).toBeInTheDocument();
  });

  it('says nothing of a limit the search did not reach', () => {
    mockApi({ 'GET /api/reactions': [] });
    const { queryByText } = renderAt(
      '/search',
      <ReactionResults
        result={RESULT}
        selectionKey="k"
        limit={3}
      />,
    );
    expect(queryByText(/stopped at/)).not.toBeInTheDocument();
  });

  it('says when the reactions were cut short', () => {
    mockApi({ 'GET /api/reactions': [] });
    const { getByText } = renderAt(
      '/search',
      <ReactionResults
        result={{ ...RESULT, truncated: true }}
        selectionKey="k"
      />,
    );
    expect(getByText(/stopped at 1,000 reactions/)).toBeInTheDocument();
  });
});
