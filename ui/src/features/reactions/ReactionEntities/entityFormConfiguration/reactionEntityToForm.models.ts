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
import { reactionInputs } from 'features/reactions/ReactionEntities/entityFormConfiguration/inputs/reactionInputs.model.tsx';
import { reactionNotes } from './reactionNotes.model.ts';
import { reactionIdentifiers } from './reactionIdentifiers.ts';
import { reactionComponents } from 'features/reactions/ReactionEntities/entityFormConfiguration/components/reactionComponents.model.ts';

export enum ReactionEntity {
  Inputs = 'inputs',
  Notes = 'notes',
  Identifiers = 'identifiers',
  Components = 'components',
}

export const reactionEntityToForm: Record<ReactionEntity, Array<ReactionFormNode>> = {
  [ReactionEntity.Inputs]: reactionInputs,
  [ReactionEntity.Notes]: reactionNotes,
  [ReactionEntity.Identifiers]: reactionIdentifiers,
  [ReactionEntity.Components]: reactionComponents,
};
