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
import { Accordion } from '@mantine/core';
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import { OutcomeListItemHeader } from './OutcomeListItemHeader.tsx';
import type { ReactionOutcome } from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.types.ts';

const renderHeader = (outcome: Partial<ReactionOutcome>) =>
  renderInReactionView(
    <Accordion>
      <Accordion.Item value="outcome">
        <OutcomeListItemHeader
          reactionId={1}
          outcome={outcome as ReactionOutcome}
          pathComponents={['outcomes', 0]}
        />
      </Accordion.Item>
    </Accordion>,
  );

describe('OutcomeListItemHeader', () => {
  it('renders the reaction-time and limiting-reactant-conversion rows when present', () => {
    const { getByText } = renderHeader({
      products: [],
      reactionTime: { value: 5, units: 'HOUR' },
      conversion: { value: 90 },
    } as unknown as ReactionOutcome);

    expect(getByText('Time:')).toBeInTheDocument();
    expect(getByText('5 h')).toBeInTheDocument();
    expect(getByText(/Limiting reactant conversion:/)).toBeInTheDocument();
    expect(getByText('90')).toBeInTheDocument();
  });

  it('omits the time and conversion rows when those values are absent', () => {
    const { queryByText } = renderHeader({ products: [] } as unknown as ReactionOutcome);
    expect(queryByText('Time:')).not.toBeInTheDocument();
    expect(queryByText(/Limiting reactant conversion:/)).not.toBeInTheDocument();
  });
});
