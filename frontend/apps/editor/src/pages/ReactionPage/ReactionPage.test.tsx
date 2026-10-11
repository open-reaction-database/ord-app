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
import { describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { AppState } from 'store/configureAppStore.ts';
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { emptyReactionData } from '@open-reaction-database/ui/testing';
import {
  useDrawer,
  useDrawerStack,
  type DrawerActions,
} from '@open-reaction-database/ui/reaction';
import { ReactionPage } from './ReactionPage.tsx';

let drawer: DrawerActions | undefined;
function DrawerProbe() {
  drawer = useDrawer();
  return <span data-testid="stack">{useDrawerStack().length}</span>;
}

vi.mock(
  'features/reactions/ReactionHeader/DatasetReactionHeader/DatasetReactionHeader.tsx',
  () => ({ DatasetReactionHeader: () => <DrawerProbe /> }),
);
vi.mock('features/reactions/ReactionEntities/ReactionTabs/ReactionContent.tsx', () => ({
  ReactionContent: () => null,
}));
vi.mock('features/reactions/ReactionDetailsSidebar/ReactionDetailsSidebar.tsx', () => ({
  ReactionDetailsSidebar: () => null,
}));
// The page shell's user menu needs Auth0 and the signed-in user; neither matters here.
vi.mock('common/components/PageContainer/PageContainer.tsx', () => ({
  PageContainer: ({ children }: Readonly<{ children: ReactNode }>) => <>{children}</>,
}));
vi.mock('store/entities/reactions/reactions.thunks.ts', async importActual => ({
  ...((await importActual()) as Record<string, unknown>),
  getReaction: () => ({ type: 'test/noop' }),
}));

const reaction = (id: number) => ({
  id,
  pb_reaction_id: `ord-${id}`,
  is_valid: true,
  validation: null,
  data: emptyReactionData(),
  previews: {},
  summary: { provenance: {}, summary: {}, conditions: '' },
});

describe('ReactionPage', () => {
  it('starts each reaction with the drawer closed', () => {
    const { getByTestId, rerender } = renderWithProviders(
      <ReactionPage
        datasetId={1}
        reactionId={2}
      />,
      {
        preloadedState: {
          entities: {
            reactions: { reactionsById: { 2: reaction(2), 3: reaction(3) } },
          },
        } as unknown as AppState,
      },
    );
    act(() => drawer?.push(['notes']));
    expect(getByTestId('stack')).toHaveTextContent('1');
    rerender(
      <ReactionPage
        datasetId={1}
        reactionId={3}
      />,
    );
    expect(getByTestId('stack')).toHaveTextContent('0');
  });
});
