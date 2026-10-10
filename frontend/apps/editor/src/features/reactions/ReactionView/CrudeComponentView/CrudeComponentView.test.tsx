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
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { CrudeComponentView } from './CrudeComponentView.tsx';
import type { ReactionCrudeComponent } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';

const searchReaction = vi.fn((id: string) => ({
  type: 'reactions/searchReaction/mock',
  payload: id,
}));
vi.mock('store/entities/reactions/reactions.thunks.ts', async importActual => ({
  ...((await importActual()) as Record<string, unknown>),
  searchReaction: (id: string) => searchReaction(id),
}));

describe('CrudeComponentView', () => {
  it('renders a link with the source reaction id and searches it on click', () => {
    const { getByText } = renderWithProviders(
      <CrudeComponentView
        crudeComponent={{ reactionId: 'rxn-123' } as ReactionCrudeComponent}
      />,
    );
    const link = getByText('rxn-123');
    expect(link).toBeInTheDocument();
    fireEvent.click(link);
    expect(searchReaction).toHaveBeenCalledWith('rxn-123');
  });
});
