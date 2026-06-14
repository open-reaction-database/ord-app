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
import { screen } from '@testing-library/react';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { ComponentMetadata } from './ComponentMetadata.tsx';
import type { ReactionInputComponent } from 'store/entities/reactions/reactionComponent/reactionComponent.types';

describe('ComponentMetadata', () => {
  it('renders the NAME identifier value and the reaction role', () => {
    const component = {
      identifiers: [{ type: 'NAME', value: 'Water' }],
      reactionRole: 'SOLVENT',
    } as unknown as ReactionInputComponent;
    renderWithMantine(<ComponentMetadata component={component} />);
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('SOLVENT')).toBeInTheDocument();
  });

  it('renders nothing identifying when there is no NAME identifier', () => {
    const component = { identifiers: [{ type: 'SMILES', value: 'O' }] } as unknown as ReactionInputComponent;
    renderWithMantine(<ComponentMetadata component={component} />);
    expect(screen.queryByText('O')).toBeNull();
  });

  it('shows the "Limiting reactant" badge only when isLimiting is True (#487)', () => {
    const limiting = { identifiers: [], isLimiting: 'True' } as unknown as ReactionInputComponent;
    const { unmount } = renderWithMantine(<ComponentMetadata component={limiting} />);
    expect(screen.getByText('Limiting reactant')).toBeInTheDocument();
    unmount();

    const notLimiting = { identifiers: [], isLimiting: 'False' } as unknown as ReactionInputComponent;
    renderWithMantine(<ComponentMetadata component={notLimiting} />);
    expect(screen.queryByText('Limiting reactant')).toBeNull();
  });

  it('renders the amount unit using the readability dictionary (#436)', () => {
    const component = {
      identifiers: [],
      amount: { value: '5', units: 'GRAM' },
    } as unknown as ReactionInputComponent;
    renderWithMantine(<ComponentMetadata component={component} />);
    // GRAM → "g" via the units dictionary, not the raw enum.
    expect(screen.getByText('5 g')).toBeInTheDocument();
    expect(screen.queryByText(/GRAM/)).toBeNull();
  });

  it("shows a product's yield % from its YIELD measurement (#598)", () => {
    const product = {
      identifiers: [],
      measurements: [{ type: 'YIELD', value: { type: '%', value: { value: 85 } } }],
    } as unknown as ReactionInputComponent;
    renderWithMantine(<ComponentMetadata component={product} />);
    expect(screen.getByText('85% yield')).toBeInTheDocument();
  });
});
