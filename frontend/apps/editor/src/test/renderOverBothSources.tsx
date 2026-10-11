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
import { vi } from 'vitest';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import {
  ReactionProvider,
  type ReactionSlots,
  type ReactionSnapshot,
  type ReactionSource,
  createStaticReactionSource,
} from '@open-reaction-database/ui/reaction';
import type { AppState } from 'store/configureAppStore.ts';
import { reduxReactionSource } from 'store/entities/reactions/reduxReactionSource.ts';
import { rootReducer } from 'store/rootReducer.ts';
import { fullReactionSnapshot } from '@open-reaction-database/ui/testing';

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
 * React's useId output (and Mantine's style classes built from it) differs between two mounts.
 * Nothing else may: Mantine's random element IDs match because each render seeds Math.random.
 */
export function normalizeIds(html: string): string {
  return html.replaceAll(/«r[0-9a-z]+»|:r[0-9a-z]+:|_r_[0-9a-z]+_/g, 'ID');
}

/** A linear congruential generator, so both renders draw the same numbers. */
function seededRandom(): () => number {
  let state = 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
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
  const random = vi.spyOn(Math, 'random').mockImplementation(seededRandom());
  try {
    const { container, unmount } = render(ui, { wrapper: Wrapper });
    const html = normalizeIds(container.innerHTML);
    unmount();
    return html;
  } finally {
    random.mockRestore();
  }
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
