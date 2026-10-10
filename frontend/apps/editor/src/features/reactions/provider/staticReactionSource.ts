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
import type { PreviewStatesById } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.types.ts';
import type { ReactionSnapshot, ReactionSource } from './reactionProvider.types.ts';

const NO_PREVIEWS: PreviewStatesById = {};

function unsubscribe(): void {
  // A static source never changes, so there is nothing to stop listening to.
}

/** Creates a source over a reaction that never changes, such as one shown read-only. */
export function createStaticReactionSource(
  snapshot: ReactionSnapshot | undefined,
  previews: PreviewStatesById = NO_PREVIEWS,
): ReactionSource {
  return {
    getSnapshot: () => snapshot,
    getPreviews: () => previews,
    subscribe: () => unsubscribe,
  };
}
