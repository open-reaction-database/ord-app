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
import { vi } from 'vitest';
import type { ReactionPathComponents } from '#reaction/model/reactionPathComponents.ts';
import type { ReactionPerson } from '#reaction/model/reactionProvenance/reactionProvenance.types.ts';
import type { AppReaction } from '#reaction/model/reactions.types.ts';
import { ReactionProvider } from '#reaction/provider/ReactionProvider.tsx';
import type {
  ReactionActions,
  ReactionSlots,
  ReactionSnapshot,
  ReactionSource,
} from '#reaction/provider/reactionProvider.types.ts';
import { createStaticReactionSource } from '#reaction/provider/staticReactionSource.ts';
import { reactionEntityContext } from '#reaction/view/ReactionEntities/reactionEntity.context.ts';
import { emptyReactionData } from './emptyReactionData.ts';

const Empty = () => null;

const EMPTY_SLOTS: ReactionSlots = {
  ViewDeleteButtons: Empty,
  ValueLabel: Empty,
  ViewOnlyLabel: Empty,
};

/**
 * A dataset reaction, editable when given actions or `editable` (which supplies stub
 * actions), or a read-only template.
 */
type ReactionTarget =
  | {
      reactionId?: number;
      isTemplate?: false;
      actions?: ReactionActions;
      editable?: boolean;
    }
  | { reactionId: string; isTemplate: true; actions?: never; editable?: never };

type ReactionWrapperOptions = ReactionTarget & {
  /** The whole snapshot; without it, one is built from `reaction` and `record`. */
  snapshot?: ReactionSnapshot;
  /** The reaction's data; an empty reaction by default. */
  reaction?: AppReaction;
  /** Stored fields beside `data`, such as `summary`, `pb_reaction_id`, or `validation`. */
  record?: Partial<Omit<ReactionSnapshot, 'data'>>;
  source?: ReactionSource;
  slots?: Partial<ReactionSlots>;
  /** The path of the entity whose form is open, for `reactionEntityContext`. */
  pathComponents?: ReactionPathComponents;
};

type RenderWithReactionOptions = Omit<RenderOptions, 'wrapper'> &
  ReactionWrapperOptions;

/** Actions that settle at once and change nothing, as `vi.fn` mocks for assertions. */
export function stubReactionActions() {
  return {
    update: vi.fn((_pathComponents: ReactionPathComponents, _newValue: unknown) =>
      Promise.resolve(),
    ),
    remove: vi.fn((_pathComponents: ReactionPathComponents) => Promise.resolve()),
    addIdentifierByName: vi.fn(
      (_identifiersPath: ReactionPathComponents, _name: string) =>
        Promise.resolve(false),
    ),
    currentPerson: vi.fn((): ReactionPerson | undefined => undefined),
  } satisfies ReactionActions;
}

function snapshotFor({ snapshot, reaction, record }: ReactionWrapperOptions) {
  return (
    snapshot ?? {
      data: reaction ?? emptyReactionData(),
      previews: {},
      summary: { provenance: {}, summary: {}, conditions: '' },
      ...record,
    }
  );
}

/**
 * A wrapper component, for `render` or `renderHook`, that puts its children under a
 * ReactionProvider: a static source over the reaction the options describe unless a source
 * is given, and `reactionEntityContext` at `pathComponents`.
 */
export function reactionWrapper(options: ReactionWrapperOptions = {}) {
  const { source = createStaticReactionSource(snapshotFor(options)), slots } = options;
  const target = options.isTemplate
    ? { reactionId: options.reactionId, isTemplate: true as const }
    : {
        reactionId: options.reactionId ?? 1,
        actions:
          options.actions ?? (options.editable ? stubReactionActions() : undefined),
      };
  const allSlots = { ...EMPTY_SLOTS, ...slots };
  const entityContextValue = { pathComponents: options.pathComponents ?? [] };
  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
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
    );
  };
}

/** Renders `ui` under the wrapper `reactionWrapper(options)` describes. */
export function renderWithReaction(
  ui: ReactElement,
  options: RenderWithReactionOptions = {},
) {
  const {
    reactionId,
    isTemplate,
    actions,
    editable,
    snapshot,
    reaction,
    record,
    source,
    slots,
    pathComponents,
    ...renderOptions
  } = options;
  return render(ui, { wrapper: reactionWrapper(options), ...renderOptions });
}
