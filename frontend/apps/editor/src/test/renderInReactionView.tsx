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
// Test-only render helper, not an HMR boundary.
/* eslint-disable react-refresh/only-export-components */
import { render, type RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from 'store/rootReducer.ts';
import type { AppState } from 'store/configureAppStore.ts';
import {
  reactionEntityContext,
  ReactionProvider,
  type ReactionActions,
  type ReactionSlots,
} from '@open-reaction-database/ui/reaction';
import {
  reduxReactionActions,
  reduxReactionSource,
} from 'store/entities/reactions/reduxReactionSource.ts';
import type {
  AppReaction,
  DatasetReaction,
  ReactionPathComponents,
} from '@open-reaction-database/ui/reaction/model';
import type { ReactElement, ReactNode } from 'react';
import { emptyReactionData } from '@open-reaction-database/ui/testing';

const Dummy = () => null;

const DUMMY_SLOTS: ReactionSlots = {
  ViewDeleteButtons: Dummy,
  ValueLabel: Dummy,
  ViewOnlyLabel: Dummy,
};

/** A dataset reaction, editable unless `isViewOnly`, or a template (a string ID, read-only). */
type ReactionViewTarget =
  | { reactionId?: number; isViewOnly?: boolean; actions?: ReactionActions }
  | { reactionId: string; isViewOnly?: never; actions?: never };

type ReactionViewOptions = Omit<RenderOptions, 'wrapper'> &
  ReactionViewTarget & {
    pathComponents?: ReactionPathComponents;
    reaction?: AppReaction;
    /** Stored fields beside `data`, such as `pb_reaction_id`, `is_valid`, or `validation`. */
    record?: Partial<Omit<DatasetReaction, 'id' | 'data'>>;
    slots?: Partial<ReactionSlots>;
  };

/**
 * Renders a component of the reaction view under ReactionProvider, over a store that holds the
 * reaction, with `reactionEntityContext` set to `pathComponents`.
 */
export function renderInReactionView(
  ui: ReactElement,
  options: ReactionViewOptions = {},
) {
  const {
    reactionId = 1,
    pathComponents = [],
    reaction,
    record,
    isViewOnly = false,
    actions,
    slots,
    ...renderOptions
  } = options;
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: {
      entities: {
        reactions: {
          reactionsById: {
            [reactionId]: {
              id: reactionId,
              data: reaction ?? emptyReactionData(),
              previews: {},
              summary: { provenance: {}, summary: {}, conditions: '' },
              ...record,
            },
          },
        },
      },
    } as unknown as AppState,
  });
  // Built once, outside Wrapper, so a rerender keeps the same source and actions.
  const source = reduxReactionSource(store, reactionId);
  const target =
    typeof reactionId === 'string'
      ? { reactionId, isTemplate: true as const }
      : {
          reactionId,
          actions: isViewOnly
            ? undefined
            : (actions ?? reduxReactionActions(store, reactionId)),
        };
  const allSlots = { ...DUMMY_SLOTS, ...slots };
  const entityContextValue = { pathComponents };
  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <Provider store={store}>
        <MantineProvider>
          <ReactionProvider
            {...target}
            source={source}
            slots={allSlots}
          >
            <reactionEntityContext.Provider value={entityContextValue}>
              {children}
            </reactionEntityContext.Provider>
          </ReactionProvider>
        </MantineProvider>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
