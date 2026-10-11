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
// Test-only render helper, not an HMR boundary.
/* eslint-disable react-refresh/only-export-components */
import { MantineProvider } from '@mantine/core';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { ReactionProvider } from 'features/reactions/provider/ReactionProvider.tsx';
import type {
  ReactionSlots,
  ReactionSnapshot,
  ReactionSource,
} from 'features/reactions/provider/reactionProvider.types.ts';
import { createStaticReactionSource } from 'features/reactions/provider/staticReactionSource.ts';
import type { AppState } from 'store/configureAppStore.ts';
import { reduxReactionSource } from 'store/entities/reactions/reduxReactionSource.ts';
import { rootReducer } from 'store/rootReducer.ts';
import { fullReactionSnapshot } from './fullReactionSnapshot.ts';

const Empty = () => null;

export const EMPTY_SLOTS: ReactionSlots = {
  ViewDeleteButtons: Empty,
  ValueLabel: Empty,
  ViewOnlyLabel: Empty,
};

/** A store holding `snapshot` as reaction 1, or no reaction at all. */
export function makeContractStore(snapshot?: ReactionSnapshot) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: snapshot
      ? ({
          entities: { reactions: { reactionsById: { 1: { id: 1, ...snapshot } } } },
        } as unknown as AppState)
      : undefined,
  });
}

/**
 * Generated IDs differ between two mounts: React's useId output (and Mantine's style classes
 * built from it) and Mantine's random element IDs. Nothing else may.
 */
function normalizeIds(html: string): string {
  return html.replaceAll(
    /«r[0-9a-z]+»|:r[0-9a-z]+:|_r_[0-9a-z]+_|mantine-[0-9a-z]{9}\b/g,
    'ID',
  );
}

function renderOver(
  source: ReactionSource,
  store: ReturnType<typeof makeContractStore>,
  ui: ReactElement,
): string {
  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <Provider store={store}>
        <MantineProvider>
          <ReactionProvider
            reactionId={1}
            source={source}
            slots={EMPTY_SLOTS}
          >
            {children}
          </ReactionProvider>
        </MantineProvider>
      </Provider>
    );
  }
  const { container, unmount } = render(ui, { wrapper: Wrapper });
  const html = normalizeIds(container.innerHTML);
  unmount();
  return html;
}

/**
 * Renders `ui` over a static source with an empty store, and over the Redux source with the
 * reaction in the store, and returns both HTML strings. A component that reads the reaction
 * from the store renders differently over the two. Each conversion of the fixture generates
 * new entity IDs, so a caller that addresses an entity by ID passes the snapshot it read the
 * ID from.
 */
export function renderOverBothSources(
  ui: ReactElement,
  snapshot: ReactionSnapshot = fullReactionSnapshot(),
): [string, string] {
  const seededStore = makeContractStore(snapshot);
  return [
    renderOver(createStaticReactionSource(snapshot), makeContractStore(), ui),
    renderOver(reduxReactionSource(seededStore, 1), seededStore, ui),
  ];
}
