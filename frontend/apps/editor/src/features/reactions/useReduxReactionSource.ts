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
import { useMemo } from 'react';
import { useStore } from 'react-redux';
import type { ReactionSource } from 'features/reactions/provider/reactionProvider.types.ts';
import type { AppState } from 'store/configureAppStore.ts';
import { reduxReactionSource } from 'store/entities/reactions/reduxReactionSource.ts';
import type { ReactionId } from 'store/entities/reactions/reactions.types.ts';

/** A source over one reaction in the editor's store, rebuilt only when the reaction ID changes. */
export function useReduxReactionSource(reactionId: ReactionId): ReactionSource {
  const store = useStore<AppState>();
  return useMemo(() => reduxReactionSource(store, reactionId), [store, reactionId]);
}
