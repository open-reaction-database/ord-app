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
import { describe, it, expect, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { SearchReactionLink } from './SearchReactionLink.tsx';

const searchReaction = vi.fn((id: string) => ({
  type: 'reactions/searchReaction/mock',
  payload: id,
}));
vi.mock('store/entities/reactions/reactions.thunks.ts', async importActual => ({
  ...((await importActual()) as Record<string, unknown>),
  searchReaction: (id: string) => searchReaction(id),
}));

describe('SearchReactionLink', () => {
  it('searches the dataset for the reaction when clicked', () => {
    const { getByText } = renderWithProviders(
      <SearchReactionLink pbReactionId="rxn-123" />,
    );
    fireEvent.click(getByText('rxn-123'));
    expect(searchReaction).toHaveBeenCalledWith('rxn-123');
  });
});
