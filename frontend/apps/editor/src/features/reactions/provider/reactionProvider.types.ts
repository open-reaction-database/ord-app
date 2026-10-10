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
import type { FC } from 'react';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type { ReactionValueLabelProps } from 'features/reactions/ReactionInteractions/ReactionValueLabel/reactionValueLabel.types.ts';
import type { ReactionViewDeleteButtonsProps } from 'features/reactions/ReactionInteractions/ReactionViewDeleteButtons/reactionViewDeleteButtons.types.ts';
import type {
  BaseReaction,
  DatasetReaction,
} from 'store/entities/reactions/reactions.types.ts';
import type { PreviewStatesById } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.types.ts';

/**
 * One reaction as its source holds it. A dataset reaction carries its ORD ID, validity, and
 * validation; a template carries none of them.
 */
export type ReactionSnapshot = BaseReaction &
  Partial<Pick<DatasetReaction, 'pb_reaction_id' | 'is_valid' | 'validation'>>;

/**
 * One reaction's data and molecule previews, read through `useSyncExternalStore`.
 *
 * A host keeps one source object per reaction across renders (for example with useMemo);
 * a new source resubscribes every hook beneath the provider.
 */
export interface ReactionSource {
  /**
   * Returns the same object until the reaction changes, or undefined while there is no such
   * reaction: before it loads, after it is removed, or for an unknown ID.
   */
  getSnapshot(): ReactionSnapshot | undefined;
  /** Returns the same object until a preview changes. */
  getPreviews(): PreviewStatesById;
  subscribe(listener: () => void): () => void;
}

/**
 * Edits to one reaction. A provider given no actions is read-only.
 *
 * Each promise settles once the edit is saved or the save has failed, and resolves either
 * way: the host app reports a failed save itself rather than through a rejection.
 */
export interface ReactionActions {
  update(pathComponents: ReactionPathComponents, newValue: unknown): Promise<void>;
  remove(pathComponents: ReactionPathComponents): Promise<void>;
}

/** Components the host app supplies for the parts of the view it owns. */
export interface ReactionSlots {
  ViewDeleteButtons: FC<ReactionViewDeleteButtonsProps>;
  ValueLabel: FC<ReactionValueLabelProps>;
  ViewOnlyLabel: FC<ReactionValueLabelProps>;
}

export interface ReactionProviderValue {
  source: ReactionSource;
  actions?: ReactionActions;
  isTemplate: boolean;
  slots: ReactionSlots;
}
