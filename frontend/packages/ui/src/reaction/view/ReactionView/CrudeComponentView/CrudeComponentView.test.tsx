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
import { renderWithReaction } from '#testing/renderWithReaction.tsx';
import type { ReactionLinkProps } from '#reaction/provider/reactionProvider.types.ts';
import type { ReactionCrudeComponent } from '#reaction/model/reactionsInputs/reactionInputs.types.ts';
import { CrudeComponentView } from './CrudeComponentView.tsx';

const crude = { reactionId: 'rxn-123' } as ReactionCrudeComponent;

function TestLink({ pbReactionId }: Readonly<ReactionLinkProps>) {
  return <a href={`/reactions/${pbReactionId}`}>{pbReactionId}</a>;
}

describe('CrudeComponentView', () => {
  it('links the reaction through the host app’s link slot', () => {
    const { getByRole } = renderWithReaction(
      <CrudeComponentView crudeComponent={crude} />,
      { editable: true, slots: { ReactionLink: TestLink } },
    );
    expect(getByRole('link', { name: 'rxn-123' })).toHaveAttribute(
      'href',
      '/reactions/rxn-123',
    );
  });

  it('shows the reaction ID as text when the host supplies no link', () => {
    const { getByText, queryByRole } = renderWithReaction(
      <CrudeComponentView crudeComponent={crude} />,
      { editable: true },
    );
    expect(getByText('rxn-123')).toBeInTheDocument();
    expect(queryByRole('link')).not.toBeInTheDocument();
  });

  it.each([
    ['empty', ''],
    ['unset', undefined],
  ])('offers no link when the reaction ID is %s', (_label, reactionId) => {
    const { queryByRole } = renderWithReaction(
      <CrudeComponentView
        crudeComponent={{ ...crude, reactionId } as ReactionCrudeComponent}
      />,
      { editable: true, slots: { ReactionLink: TestLink } },
    );
    expect(queryByRole('link')).not.toBeInTheDocument();
  });
});
