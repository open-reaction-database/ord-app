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
// Test-only render helper (exports a fixture factory + a Dummy context component), not an HMR boundary.
/* eslint-disable react-refresh/only-export-components */
import { render, type RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from 'store/rootReducer.ts';
import type { AppState } from 'store/configureAppStore.ts';
import { reactionContext } from 'features/reactions/reactions.context.ts';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { ordSetupToReactionSetup } from 'store/entities/reactions/reactionSetup/reactionSetup.converter.ts';
import { ordConditionsToReaction } from 'store/entities/reactions/reactionConditions/reactionConditions.converter.ts';
import { ordNotesToReaction } from 'store/entities/reactions/reactionNotes/reactionNotes.converters.ts';
import { ordProvenanceToReaction } from 'store/entities/reactions/reactionProvenance/reactionProvenance.converters.ts';
import type { AppReaction } from 'store/entities/reactions/reactions.types.ts';
import type { ReactionsContext } from 'features/reactions/reactions.types.ts';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type { ReactElement, ReactNode } from 'react';

const Dummy = () => null;

/** A structurally-valid empty reaction, built from the same default converters the app uses. */
export function emptyReactionData(): AppReaction {
  return {
    reactionId: '',
    inputs: {},
    outcomes: [],
    identifiers: [],
    setup: ordSetupToReactionSetup(null),
    observations: [],
    conditions: ordConditionsToReaction(null),
    notes: ordNotesToReaction(null),
    provenance: ordProvenanceToReaction(null),
    workups: [],
  } as unknown as AppReaction;
}

// Only the dataset-reaction shape is modelled here (isTemplate: false). The template variant of
// ReactionsContext additionally requires a string reactionId + isViewOnly: true; if a template
// smoke test is ever needed, add a dedicated helper rather than loosening these options.
interface ReactionViewOptions extends Omit<RenderOptions, 'wrapper'> {
  reactionId?: number;
  pathComponents?: ReactionPathComponents;
  reaction?: AppReaction;
  isViewOnly?: boolean;
}

/**
 * Renders a ReactionView-tree component with the reaction/entity contexts and a seeded reaction in
 * the store, so components that read `reactionContext`/`reactionEntityContext` mount correctly.
 */
export function renderInReactionView(ui: ReactElement, options: ReactionViewOptions = {}) {
  const { reactionId = 1, pathComponents = [], reaction, isViewOnly = false, ...renderOptions } = options;
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: {
      entities: {
        reactions: { reactionsById: { [reactionId]: { id: reactionId, data: reaction ?? emptyReactionData() } } },
      },
    } as unknown as AppState,
  });
  const reactionCtxValue = {
    reactionId,
    isTemplate: false,
    isViewOnly,
    ViewDeleteButtonsComponent: Dummy,
    ValueLabelComponent: Dummy,
    ViewOnlyLabelComponent: Dummy,
  } as unknown as ReactionsContext;
  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <Provider store={store}>
        <MantineProvider>
          <reactionContext.Provider value={reactionCtxValue}>
            <reactionEntityContext.Provider value={{ reactionId, pathComponents }}>
              {children}
            </reactionEntityContext.Provider>
          </reactionContext.Provider>
        </MantineProvider>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
