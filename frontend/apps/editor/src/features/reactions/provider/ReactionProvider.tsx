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
import { reactionProviderContext } from './reactionProvider.context.ts';
import type {
  ReactionActions,
  ReactionProviderValue,
  ReactionSlots,
  ReactionSource,
} from './reactionProvider.types.ts';

interface ReactionProviderBaseProps {
  /** Keep the same source across renders (for example with useMemo); a new one resubscribes every hook. */
  source: ReactionSource;
  slots: ReactionSlots;
  children: ReactNode;
}

/** A dataset reaction: a numeric ID, editable when actions are given. */
interface DatasetReactionProviderProps extends ReactionProviderBaseProps {
  /** The ID that components reading `reactionContext` select by. */
  reactionId: number;
  isTemplate?: false;
  actions?: ReactionActions;
}

/** A template: a string ID, and always read-only. */
interface TemplateReactionProviderProps extends ReactionProviderBaseProps {
  /** The ID that components reading `reactionContext` select by. */
  reactionId: string;
  isTemplate: true;
  actions?: never;
}

type ReactionProviderProps =
  | DatasetReactionProviderProps
  | TemplateReactionProviderProps;

/**
 * Supplies one reaction, its edit actions if it can be edited, and the host app's slot
 * components to the view beneath. It also supplies `reactionContext`, built from the same
 * props, for components that read it.
 */
export function ReactionProvider(props: Readonly<ReactionProviderProps>) {
  const { reactionId, source, actions, slots, children } = props;
  const isTemplate = props.isTemplate === true;
  const value = useMemo(
    (): ReactionProviderValue => ({ source, actions, isTemplate, slots }),
    [source, actions, isTemplate, slots],
  );
  const legacyValue = useMemo((): ReactionsContext => {
    const components = {
      ViewDeleteButtonsComponent: slots.ViewDeleteButtons,
      ValueLabelComponent: slots.ValueLabel,
      ViewOnlyLabelComponent: slots.ViewOnlyLabel,
    };
    return typeof reactionId === 'string'
      ? { ...components, reactionId, isTemplate: true, isViewOnly: true }
      : {
          ...components,
          reactionId,
          isTemplate: false,
          isViewOnly: actions === undefined,
        };
  }, [reactionId, actions, slots]);
  return (
    <reactionProviderContext.Provider value={value}>
      <reactionContext.Provider value={legacyValue}>
        {children}
      </reactionContext.Provider>
    </reactionProviderContext.Provider>
  );
}
