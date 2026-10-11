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
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { ReactionProvider } from '#reaction/provider/ReactionProvider.tsx';
import type {
  ReactionActions,
  ReactionSlots,
  ReactionSnapshot,
  ReactionSource,
} from '#reaction/provider/reactionProvider.types.ts';
import { createStaticReactionSource } from '#reaction/provider/staticReactionSource.ts';

const Empty = () => null;

const EMPTY_SLOTS: ReactionSlots = {
  ViewDeleteButtons: Empty,
  ValueLabel: Empty,
  ViewOnlyLabel: Empty,
};

/** A dataset reaction, editable when given actions, or a read-only template. */
type ReactionTarget =
  | { reactionId?: number; isTemplate?: false; actions?: ReactionActions }
  | { reactionId: string; isTemplate: true; actions?: never };

type ReactionWrapperOptions = ReactionTarget & {
  snapshot?: ReactionSnapshot;
  source?: ReactionSource;
  slots?: Partial<ReactionSlots>;
};

type RenderWithReactionOptions = Omit<RenderOptions, 'wrapper'> &
  ReactionWrapperOptions;

/**
 * A wrapper component, for `render` or `renderHook`, that puts its children under a
 * ReactionProvider: a static source over `snapshot` unless a source is given.
 */
export function reactionWrapper(options: ReactionWrapperOptions = {}) {
  const { snapshot, source = createStaticReactionSource(snapshot), slots } = options;
  const target = options.isTemplate
    ? { reactionId: options.reactionId, isTemplate: true as const }
    : { reactionId: options.reactionId ?? 1, actions: options.actions };
  const allSlots = { ...EMPTY_SLOTS, ...slots };
  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <MantineProvider>
        <ReactionProvider
          {...target}
          source={source}
          slots={allSlots}
        >
          {children}
        </ReactionProvider>
      </MantineProvider>
    );
  };
}

/** Renders under a ReactionProvider: a static source over `snapshot` unless a source is given. */
export function renderWithReaction(
  ui: ReactElement,
  options: RenderWithReactionOptions = {},
) {
  const { reactionId, isTemplate, actions, snapshot, source, slots, ...renderOptions } =
    options;
  return render(ui, { wrapper: reactionWrapper(options), ...renderOptions });
}
