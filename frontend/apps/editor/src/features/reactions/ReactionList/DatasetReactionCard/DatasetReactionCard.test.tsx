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
import { Route, Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import type { AppState } from 'store/configureAppStore.ts';
import { emptyReactionData } from 'test/emptyReactionData.ts';
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { DatasetReactionCard } from './DatasetReactionCard.tsx';

const state = (isValid: boolean) =>
  ({
    entities: {
      reactions: {
        reactionsById: {
          4: {
            id: 4,
            pb_reaction_id: 'ord-four',
            is_valid: isValid,
            validation: null,
            data: emptyReactionData(),
            previews: {},
            summary: { provenance: {}, summary: {}, conditions: '' },
          },
        },
      },
    },
  }) as unknown as AppState;

function renderCard(isValid: boolean) {
  const { hook } = memoryLocation({ path: '/datasets/2' });
  return renderWithProviders(
    <Router hook={hook}>
      <Route path="/datasets/:datasetId">
        <DatasetReactionCard
          reactionId={4}
          index={1}
        />
      </Route>
    </Router>,
    { preloadedState: state(isValid) },
  );
}

describe('DatasetReactionCard', () => {
  it('links the reaction ID to its page and shows its preview', () => {
    const { getByRole, getByText } = renderCard(true);
    expect(getByRole('link', { name: 'ord-four' })).toHaveAttribute(
      'href',
      '/datasets/2/reactions/4',
    );
    expect(getByText('There are no Inputs and Outcomes yet')).toBeInTheDocument();
  });

  it('marks an invalid reaction', () => {
    expect(renderCard(false).getByText('Invalid reaction')).toBeInTheDocument();
  });
});
