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
import type { AppReaction } from '@open-reaction-database/ui/reaction/model';
import { emptyReactionData } from '@open-reaction-database/ui/testing';
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import { ReactionCard } from './ReactionCard.tsx';

describe('ReactionCard', () => {
  it('renders the title, the actions, and the reaction preview', () => {
    const { getByText } = renderInReactionView(
      <ReactionCard
        title={<span>Card title</span>}
        actions={<button type="button">Act</button>}
      />,
    );
    expect(getByText('Card title')).toBeInTheDocument();
    expect(getByText('Act')).toBeInTheDocument();
    expect(getByText('There are no Inputs and Outcomes yet')).toBeInTheDocument();
  });

  it('lists the provenance, the summary, and the conditions only when asked for details', () => {
    const options = {
      reaction: {
        ...emptyReactionData(),
        inputs: { in1: { id: 'in1', name: 'Input A', components: [] } },
      } as unknown as AppReaction,
      record: {
        summary: {
          provenance: { Creator: 'Ada' },
          summary: { Yield: '90%' },
          conditions: 'Stirred at 25 C',
        },
      },
    };
    const card = (showDetails?: boolean) => (
      <ReactionCard
        title="Card title"
        actions={null}
        showDetails={showDetails}
      />
    );
    const plain = renderInReactionView(card(), options);
    expect(plain.queryByText('Provenance:')).not.toBeInTheDocument();
    expect(plain.queryByText('Summary:')).not.toBeInTheDocument();
    expect(plain.queryByText('Stirred at 25 C')).not.toBeInTheDocument();
    plain.unmount();
    const detailed = renderInReactionView(card(true), options);
    expect(detailed.getByText('Provenance:')).toBeInTheDocument();
    expect(detailed.getByText('Ada')).toBeInTheDocument();
    expect(detailed.getByText('Summary:')).toBeInTheDocument();
    expect(detailed.getByText('90%')).toBeInTheDocument();
    expect(detailed.getByText('Stirred at 25 C')).toBeInTheDocument();
  });
});
