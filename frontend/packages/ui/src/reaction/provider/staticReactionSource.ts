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
import {
  renderPreviews,
  type ComponentProductPreview,
  type PreviewsById,
  type PreviewStatesById,
} from '#reaction/previews/index.ts';
import type { ReactionSnapshot, ReactionSource } from './reactionProvider.types.ts';

function unsubscribe(): void {
  // A fixed source never changes, so there is nothing to stop listening to.
}

function fixedSource(
  snapshot: ReactionSnapshot | undefined,
  previews: PreviewStatesById,
): ReactionSource {
  return {
    getSnapshot: () => snapshot,
    getPreviews: () => previews,
    subscribe: () => unsubscribe,
  };
}

/** A null molblock has no preview to wait for; every other one is loading. */
function loadingStates(molblocksById: PreviewsById): PreviewStatesById {
  return Object.fromEntries(
    Object.entries(molblocksById).map(([key, molblock]) => [
      key,
      { isLoading: molblock !== null, svg: null },
    ]),
  );
}

/**
 * Creates a source over a reaction that never changes, such as one shown read-only.
 *
 * Args:
 *   snapshot: The reaction, or undefined for one that has not loaded.
 *   previews: The rendered previews. Without them, the source renders the snapshot's
 *     molblocks when first subscribed to and notifies its subscribers when they arrive.
 *
 * Returns:
 *   The source, whose getSnapshot and getPreviews return the same objects between changes.
 */
export function createStaticReactionSource(
  snapshot: ReactionSnapshot | undefined,
  previews?: PreviewStatesById,
): ReactionSource {
  if (previews) {
    return fixedSource(snapshot, previews);
  }
  const molblocksById = snapshot?.previews ?? {};
  let current = loadingStates(molblocksById);
  if (!Object.values(current).some(state => state.isLoading)) {
    return fixedSource(snapshot, current);
  }
  let isRendering = false;
  const listeners = new Set<() => void>();
  const show = (svgFor: (key: string) => ComponentProductPreview) => {
    current = Object.fromEntries(
      Object.keys(molblocksById).map(key => [
        key,
        { isLoading: false, svg: svgFor(key) },
      ]),
    );
    for (const listener of listeners) {
      listener();
    }
  };
  return {
    getSnapshot: () => snapshot,
    getPreviews: () => current,
    subscribe: listener => {
      listeners.add(listener);
      if (!isRendering) {
        isRendering = true;
        void renderPreviews(molblocksById).then(
          svgsById => show(key => svgsById[key] ?? null),
          // A failed render still ends the loading state; the previews show as missing.
          () => show(() => null),
        );
      }
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
