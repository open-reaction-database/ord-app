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
import { Accordion } from '@mantine/core';
import { renderWithReaction } from '@open-reaction-database/ui/testing';
import { InputComponentsListItem } from './InputComponentsListItem.tsx';
import type { ReactionInputWithoutName } from '@open-reaction-database/ui/reaction/model';

// Structure preview is exercised elsewhere; stub it so the rows stay simple.
vi.mock('common/components/ReactionPreview/ReactionComponentPreview.tsx', () => ({
  ReactionComponentPreview: () => <div data-testid="preview" />,
}));

const renderItem = (input: ReactionInputWithoutName) =>
  renderWithReaction(
    <Accordion defaultValue="in1">
      <InputComponentsListItem
        input={input}
        name="Input 1"
        pathComponents={['inputs', 'in1']}
        historyPathComponents={[]}
      />
    </Accordion>,
    { editable: true },
  );

describe('InputComponentsListItem', () => {
  it('shows the empty state when the input has no components', () => {
    const { getByText } = renderItem({
      id: 'in1',
      components: [],
    } as unknown as ReactionInputWithoutName);
    expect(getByText('Input 1')).toBeInTheDocument();
    expect(getByText('There are no Components yet')).toBeInTheDocument();
  });

  it('renders a component row with its details when components are present', () => {
    const input = {
      id: 'in1',
      components: [
        {
          id: 'c1',
          identifiers: [{ id: 'i1', type: 'SMILES', value: 'O' }],
          reactionRole: 'REACTANT',
          amount: { value: 10, units: 'MILLILITER' },
        },
      ],
    } as unknown as ReactionInputWithoutName;
    const { getByText } = renderItem(input);
    expect(getByText('SMILES:')).toBeInTheDocument();
    expect(getByText('REACTANT')).toBeInTheDocument();
  });
});
