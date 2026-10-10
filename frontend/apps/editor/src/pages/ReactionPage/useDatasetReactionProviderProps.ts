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
import type {
  ReactionActions,
  ReactionSlots,
  ReactionSource,
} from 'features/reactions/provider/reactionProvider.types.ts';
import { DatasetReactionValueLabel } from 'features/reactions/ReactionInteractions/ReactionValueLabel/DatasetReactionValueLable.tsx';
import { ReactionEditDeleteButtons } from 'features/reactions/ReactionInteractions/ReactionViewDeleteButtons/ReactionEditDeleteButtons.tsx';
import { ReactionViewButton } from 'features/reactions/ReactionInteractions/ReactionViewDeleteButtons/ReactionViewButton.tsx';
import type { AppState } from 'store/configureAppStore.ts';
import {
  reduxReactionActions,
  reduxReactionSource,
} from 'store/entities/reactions/reduxReactionSource.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';

const EDITABLE_SLOTS: ReactionSlots = {
  ViewDeleteButtons: ReactionEditDeleteButtons,
  ValueLabel: DatasetReactionValueLabel,
  ViewOnlyLabel: DatasetReactionValueLabel,
};

const VIEW_ONLY_SLOTS: ReactionSlots = {
  ...EDITABLE_SLOTS,
  ViewDeleteButtons: ReactionViewButton,
};

/** The ReactionProvider props for a dataset reaction, editable when the user may edit it. */
export function useDatasetReactionProviderProps(
  reactionId: number,
  canEdit: boolean,
): {
  reactionId: number;
  source: ReactionSource;
  actions?: ReactionActions;
  slots: ReactionSlots;
} {
  const store = useStore<AppState>();
  const dispatch = useAppDispatch();
  const source = useMemo(
    () => reduxReactionSource(store, reactionId),
    [store, reactionId],
  );
  const actions = useMemo(
    () => (canEdit ? reduxReactionActions(dispatch, reactionId) : undefined),
    [canEdit, dispatch, reactionId],
  );
  return {
    reactionId,
    source,
    actions,
    slots: canEdit ? EDITABLE_SLOTS : VIEW_ONLY_SLOTS,
  };
}
