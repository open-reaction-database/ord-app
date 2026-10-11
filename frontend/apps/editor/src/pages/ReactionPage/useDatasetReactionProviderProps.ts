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
import type { AppState } from 'store/configureAppStore.ts';
import {
  type ReactionActions,
  type ReactionSlots,
  type ReactionSource,
  DatasetReactionValueLabel,
  ReactionViewButton,
} from '@open-reaction-database/ui/reaction';
import { ReactionEditDeleteButtons } from 'features/reactions/ReactionInteractions/ReactionViewDeleteButtons/ReactionEditDeleteButtons.tsx';
import { SearchReactionLink } from 'features/reactions/ReactionInteractions/SearchReactionLink/SearchReactionLink.tsx';
import { reduxReactionActions } from 'store/entities/reactions/reduxReactionSource.ts';
import { useReduxReactionSource } from 'features/reactions/useReduxReactionSource.ts';
import { ComponentsKetcherEditor } from 'features/reactions/ComponentsKetcherEditor/ComponentsKetcherEditor.tsx';
import { useAppDispatch } from 'store/useAppDispatch.ts';

const EDITABLE_SLOTS: ReactionSlots = {
  ViewDeleteButtons: ReactionEditDeleteButtons,
  ValueLabel: DatasetReactionValueLabel,
  ViewOnlyLabel: DatasetReactionValueLabel,
  ReactionLink: SearchReactionLink,
  MoleculeEditor: ComponentsKetcherEditor,
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
  const source = useReduxReactionSource(reactionId);
  const actions = useMemo(
    () =>
      canEdit
        ? reduxReactionActions({ dispatch, getState: store.getState }, reactionId)
        : undefined,
    [canEdit, dispatch, store, reactionId],
  );
  return {
    reactionId,
    source,
    actions,
    slots: canEdit ? EDITABLE_SLOTS : VIEW_ONLY_SLOTS,
  };
}
