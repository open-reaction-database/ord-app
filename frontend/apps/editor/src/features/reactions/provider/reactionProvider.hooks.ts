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
import { useContext } from 'react';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type { ReactionInput } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import type { PreviewStatesById } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.types.ts';
import { getDeepReactionPart } from 'store/entities/reactions/reactions.utils.ts';
import { shallowEqualArrays, shallowEqualRecords } from './equality.ts';
import { orderInputs } from './orderInputs.ts';
import { reactionProviderContext } from './reactionProvider.context.ts';
import type {
  ReactionActions,
  ReactionProviderValue,
  ReactionSlots,
  ReactionSnapshot,
} from './reactionProvider.types.ts';

function useProviderValue(): ReactionProviderValue {
  const value = useContext(reactionProviderContext);
  if (!value) {
    throw new Error('Reaction hooks must be used inside a ReactionProvider.');
  }
  return value;
}

function useSnapshotSelector<T>(
  select: (snapshot: ReactionSnapshot | undefined) => T,
  isEqual?: (a: T, b: T) => boolean,
): T {
  const { source } = useProviderValue();
  return useSyncExternalStoreWithSelector(
    source.subscribe,
    source.getSnapshot,
    source.getSnapshot,
    select,
    isEqual,
  );
}

/** The whole reaction; re-renders whenever any part of it changes. */
export function useReactionSnapshot(): ReactionSnapshot | undefined {
  return useSnapshotSelector(snapshot => snapshot);
}

/** The part of the reaction at `pathComponents`, or null if the path does not exist. */
export function useReactionPart<T = unknown>(
  pathComponents: ReactionPathComponents,
): T | null {
  return useSnapshotSelector(snapshot =>
    snapshot
      ? ((getDeepReactionPart(snapshot.data, pathComponents) ?? null) as T | null)
      : null,
  );
}

/** The reaction's inputs in display order. */
export function useOrderedInputs(): Array<ReactionInput> {
  return useSnapshotSelector(
    snapshot => orderInputs(snapshot?.data.inputs ?? {}),
    shallowEqualArrays,
  );
}

/** The previews for `entityIds`; an ID with no preview maps to undefined. */
export function usePreviews(entityIds: Array<string>): PreviewStatesById {
  const { source } = useProviderValue();
  return useSyncExternalStoreWithSelector(
    source.subscribe,
    source.getPreviews,
    source.getPreviews,
    previews =>
      Object.fromEntries(entityIds.map(id => [id, previews[id]])) as PreviewStatesById,
    shallowEqualRecords,
  );
}

/** The reaction's edit actions, or undefined when it is read-only. */
export function useReactionActions(): ReactionActions | undefined {
  return useProviderValue().actions;
}

export function useIsViewOnly(): boolean {
  return useProviderValue().actions === undefined;
}

export function useReactionSlots(): ReactionSlots {
  return useProviderValue().slots;
}
