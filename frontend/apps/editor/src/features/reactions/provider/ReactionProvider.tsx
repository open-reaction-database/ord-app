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
import { useMemo, type ReactNode } from 'react';
import { reactionContext } from 'features/reactions/reactions.context.ts';
import type { ReactionsContext } from 'features/reactions/reactions.types.ts';
import type { ReactionId } from 'store/entities/reactions/reactions.types.ts';
import { reactionProviderContext } from './reactionProvider.context.ts';
import type {
  ReactionActions,
  ReactionProviderValue,
  ReactionSlots,
  ReactionSource,
} from './reactionProvider.types.ts';

interface ReactionProviderProps {
  /** The ID that components still reading `reactionContext` select by. */
  reactionId: ReactionId;
  source: ReactionSource;
  actions?: ReactionActions;
  isTemplate?: boolean;
  slots: ReactionSlots;
  children: ReactNode;
}

/**
 * Supplies one reaction, its edit actions if it can be edited, and the host app's slot
 * components to the view beneath. It also supplies `reactionContext` for the components
 * that have not moved to the hooks.
 */
export function ReactionProvider({
  reactionId,
  source,
  actions,
  isTemplate = false,
  slots,
  children,
}: Readonly<ReactionProviderProps>) {
  const value = useMemo(
    (): ReactionProviderValue => ({ source, actions, isTemplate, slots }),
    [source, actions, isTemplate, slots],
  );
  // ReactionsContext pairs string IDs with templates; the pages keep that pairing.
  const legacyValue = useMemo(
    () =>
      ({
        reactionId,
        isTemplate,
        isViewOnly: actions === undefined,
        ViewDeleteButtonsComponent: slots.ViewDeleteButtons,
        ValueLabelComponent: slots.ValueLabel,
        ViewOnlyLabelComponent: slots.ViewOnlyLabel,
      }) as ReactionsContext,
    [reactionId, isTemplate, actions, slots],
  );
  return (
    <reactionProviderContext.Provider value={value}>
      <reactionContext.Provider value={legacyValue}>
        {children}
      </reactionContext.Provider>
    </reactionProviderContext.Provider>
  );
}
