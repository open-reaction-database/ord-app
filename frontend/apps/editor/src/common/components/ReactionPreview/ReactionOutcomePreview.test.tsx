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
import { describe, it, expect, vi } from 'vitest';
import { renderInReactionView, emptyReactionData } from 'test/renderInReactionView.tsx';
import { ReactionOutcomePreview } from './ReactionOutcomePreview.tsx';
import type { AppReaction } from 'store/entities/reactions/reactions.types.ts';

vi.mock('common/components/ReactionPreview/ReactionComponentPreview.tsx', () => ({
  ReactionComponentPreview: () => <div data-testid="component-preview" />,
}));

const reactionWith = (outcome: object) =>
  ({
    ...emptyReactionData(),
    outcomes: [{ id: 'o1', products: [], ...outcome }],
  }) as unknown as AppReaction;

describe('ReactionOutcomePreview', () => {
  it('labels the outcome with its reaction time and conversion when present', () => {
    const reaction = reactionWith({
      reactionTime: { value: 5, units: 'HOUR' },
      conversion: { value: 90 },
    });
    const { getByText } = renderInReactionView(
      <ReactionOutcomePreview
        reactionId={1}
        outcomeIndex={0}
      />,
      {
        reactionId: 1,
        reaction,
      },
    );
    expect(getByText(/Outcome \(5 h, 90% conversion\)/)).toBeInTheDocument();
  });

  it('shows a bare "Outcome" label when there is no time or conversion', () => {
    const reaction = reactionWith({});
    const { getByText } = renderInReactionView(
      <ReactionOutcomePreview
        reactionId={1}
        outcomeIndex={0}
      />,
      {
        reactionId: 1,
        reaction,
      },
    );
    expect(getByText('Outcome')).toBeInTheDocument();
  });
});
