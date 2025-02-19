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
import type { ReactionFormNode } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { reactionNotes } from './reactionNotes.model.ts';
import { reactionData } from './data/reactionData.models.ts';
import { reactionInputs } from './inputs/reactionInputs.model.tsx';
import { reactionIdentifiers } from './reactionIdentifiers.ts';
import { reactionComponents } from './components/reactionComponents.model.tsx';
import { reactionComponentsPreparations } from './components/preparations/reactionComponentsPreparations.model.ts';
import { reactionComponentIdentifiers } from './componentIdentifier/reactionComponentIdentifiers.model.ts';

export enum ReactionEntity {
  Inputs = 'inputs',
  Notes = 'notes',
  Identifiers = 'identifiers',
  Components = 'components',
  ComponentPreparations = 'preparations',
  Features = 'features',
  ComponentIdentifiers = 'component_identifiers',
}

export const reactionEntityToForm: Record<ReactionEntity, Array<ReactionFormNode>> = {
  [ReactionEntity.Inputs]: reactionInputs,
  [ReactionEntity.Notes]: reactionNotes,
  [ReactionEntity.Identifiers]: reactionIdentifiers,
  [ReactionEntity.Components]: reactionComponents,
  [ReactionEntity.ComponentPreparations]: reactionComponentsPreparations,
  [ReactionEntity.Features]: reactionData,
  [ReactionEntity.ComponentIdentifiers]: reactionComponentIdentifiers,
};
