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
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { ComponentDisplayRowCustomActions } from './ComponentDisplayRowCustomActions.tsx';
import type { ReactionComponentBase } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';

// The structure preview is exercised elsewhere; stub it so this test focuses on the row layout.
vi.mock('common/components/ReactionPreview/ReactionComponentPreview.tsx', () => ({
  ReactionComponentPreview: () => <div data-testid="preview" />,
}));

const component = {
  id: 'c1',
  identifiers: [{ id: 'i1', type: 'SMILES', value: 'O' }],
  reactionRole: 'REACTANT',
} as unknown as ReactionComponentBase;

describe('ComponentDisplayRowCustomActions', () => {
  it('renders the identifiers, reaction role, rendered details, and actions', () => {
    const { getByText } = renderWithProviders(
      <ComponentDisplayRowCustomActions
        component={component}
        renderDetails={() => '10 mL'}
        actions={<span>row-actions</span>}
      />,
    );
    expect(getByText('SMILES:')).toBeInTheDocument();
    expect(getByText('O')).toBeInTheDocument();
    expect(getByText('REACTANT')).toBeInTheDocument();
    expect(getByText('10 mL')).toBeInTheDocument();
    expect(getByText('row-actions')).toBeInTheDocument();
  });
});
