/*
 * Copyright 2024 Open Reaction Database Project Authors
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
import { createSelectorFactory } from 'store/utils';
import { createSelector } from '@reduxjs/toolkit';
import type { AppState } from 'store/configureAppStore.ts';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type { DatasetReaction, ReactionTemplate, ReactionId } from 'store/entities/reactions/reactions.types.ts';
import { getDeepReactionPart } from './reactions.utils.ts';

const { buildSelector } = createSelectorFactory(state => state.entities.reactions);

export const selectReactionsOrder = buildSelector(state => state.reactionsOrder);

export const selectReactions = buildSelector(state => state.reactionsById);

export function selectReactionById(id: string): (state: AppState) => ReactionTemplate;
export function selectReactionById(id: number): (state: AppState) => DatasetReaction;
export function selectReactionById(id: ReactionId): (state: AppState) => DatasetReaction | ReactionTemplate;

export function selectReactionById(id: ReactionId): (state: AppState) => DatasetReaction | ReactionTemplate {
  return (state: AppState) => state.entities.reactions.reactionsById[id];
}

export const selectReactionsPagination = buildSelector(state => state.pagination);

export const selectActiveDatasetId = buildSelector(state => state.activeDatasetId);

export const selectIsReactionCreating = buildSelector(state => state.isReactionCreating);

export const selectReactionsLoading = buildSelector(state => state.areReactionsLoading);

export const selectReactionPartByPath =
  (reactionId: ReactionId, pathComponents: ReactionPathComponents) => (state: AppState) => {
    const reaction = selectReactionById(reactionId)(state);
    if (!reaction) {
      return null;
    }
    return getDeepReactionPart(reaction?.data, pathComponents);
  };

const selectReactionId = (_state: unknown, id: ReactionId) => id;

export const selectOrderedInputs = createSelector([selectReactions, selectReactionId], (reactions, id) => {
  const inputsMap = reactions[id]?.data?.inputs || {};
  return Object.values(inputsMap).sort((a, b) => {
    const aOrder = a.additionOrder ?? Infinity;
    const bOrder = b.additionOrder ?? Infinity;
    return aOrder === bOrder ? a.name.localeCompare(b.name) : aOrder - bOrder;
  });
});

export const selectOrderedInputsWrapper = (id: ReactionId) => (state: AppState) => selectOrderedInputs(state, id);

const selectVariableName = (_state: unknown, _id: unknown, variableName: string) => variableName;

export const selectTemplateVariables = createSelector([selectReactions, selectReactionId], (reactions, id) => {
  const reaction = reactions[id] as ReactionTemplate;
  return reaction.variables;
});

export const selectTemplateVariablesWrapper = (id: string) => (state: AppState) => selectTemplateVariables(state, id);

export const selectTemplateVariable = createSelector(
  [selectTemplateVariables, selectVariableName],
  (templateVariables, variableName) => {
    return templateVariables[variableName];
  },
);

export const selectTemplateVariableWrapper = (id: string, variableName: string) => (state: AppState) =>
  selectTemplateVariable(state, id, variableName);
