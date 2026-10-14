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
import { ReactionHeader } from '@open-reaction-database/ui/reaction';
import { renderAt } from '#test/render.tsx';
import { VIEWER0101 } from '#test/fixtures/records.ts';
import { VIEWER_SLOTS } from '#reaction/slots.ts';
import { ViewerReactionProvider } from '#reaction/ViewerReactionProvider.tsx';

describe('ViewerReactionProvider', () => {
  it('shows the record through the shared view', () => {
    const { getByRole } = renderAt(
      '/',
      <ViewerReactionProvider record={VIEWER0101}>
        <ReactionHeader />
      </ViewerReactionProvider>,
    );
    expect(getByRole('heading', { name: 'ord-viewer0101' })).toBeInTheDocument();
  });

  it('shows no validation badge, since a record carries no validity', () => {
    const { queryByText } = renderAt(
      '/',
      <ViewerReactionProvider record={VIEWER0101}>
        <ReactionHeader />
      </ViewerReactionProvider>,
    );
    expect(queryByText(/valid/i)).not.toBeInTheDocument();
  });

  it('links another reaction to its page, encoding its ID once', () => {
    const ReactionLink = VIEWER_SLOTS.ReactionLink!;
    const { getByRole } = renderAt('/', <ReactionLink pbReactionId="a/b" />);
    expect(getByRole('link', { name: 'a/b' })).toHaveAttribute(
      'href',
      '/reactions/a%2Fb',
    );
  });

  it('offers no drawing', () => {
    expect(VIEWER_SLOTS.MoleculeEditor).toBeUndefined();
  });
});
