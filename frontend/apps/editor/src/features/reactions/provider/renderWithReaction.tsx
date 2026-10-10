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
import type { ReactionId } from 'store/entities/reactions/reactions.types.ts';
import { ReactionProvider } from './ReactionProvider.tsx';
import type {
  ReactionActions,
  ReactionSlots,
  ReactionSnapshot,
  ReactionSource,
} from './reactionProvider.types.ts';
import { createStaticReactionSource } from './staticReactionSource.ts';

const Empty = () => null;

const EMPTY_SLOTS: ReactionSlots = {
  ViewDeleteButtons: Empty,
  ValueLabel: Empty,
  ViewOnlyLabel: Empty,
};

interface RenderWithReactionOptions extends Omit<RenderOptions, 'wrapper'> {
  reactionId?: ReactionId;
  snapshot?: ReactionSnapshot;
  source?: ReactionSource;
  actions?: ReactionActions;
  isTemplate?: boolean;
  slots?: Partial<ReactionSlots>;
}

/** Renders under a ReactionProvider: a static source over `snapshot` unless a source is given. */
export function renderWithReaction(
  ui: ReactElement,
  {
    reactionId = 1,
    snapshot,
    source = createStaticReactionSource(snapshot),
    actions,
    isTemplate = false,
    slots,
    ...options
  }: RenderWithReactionOptions = {},
) {
  const allSlots = { ...EMPTY_SLOTS, ...slots };
  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <MantineProvider>
        <ReactionProvider
          reactionId={reactionId}
          source={source}
          actions={actions}
          isTemplate={isTemplate}
          slots={allSlots}
        >
          {children}
        </ReactionProvider>
      </MantineProvider>
    );
  }
  return render(ui, { wrapper: Wrapper, ...options });
}
