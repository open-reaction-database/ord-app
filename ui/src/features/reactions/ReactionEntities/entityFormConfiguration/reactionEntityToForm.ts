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
import { type ReactionFormNode } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { reactionNotes } from './reactionNotes.model.ts';
import { reactionData } from 'features/reactions/ReactionEntities/entityFormConfiguration/data/reactionData.models.tsx';
import { reactionInputs } from './inputs/reactionInputs.model.tsx';
import { reactionIdentifiers } from './reactionIdentifiers.ts';
import { reactionComponents } from './components/reactionComponents.model.tsx';
import { reactionComponentsPreparations } from './components/preparations/reactionComponentsPreparations.model.ts';
import { reactionComponentIdentifiers } from './componentIdentifier/reactionComponentIdentifiers.model.ts';
import { reactionOutcomes } from './outcomes/reactionOutcomes.models.ts';
import { reactionAnalyses } from './outcomes/reactionAnalyses.models.ts';
import { reactionProducts } from 'features/reactions/ReactionEntities/entityFormConfiguration/components/reactionProducts.model.ts';
import { reactionMeasurements } from 'features/reactions/ReactionEntities/entityFormConfiguration/measurements/reactionMeasurements.model.ts';
import { reactionCrudeComponents } from 'features/reactions/ReactionEntities/entityFormConfiguration/components/reactionCrudeComponents.model.ts';
import { ReactionNodeEntity } from 'store/entities/reactions/reactions.types.ts';

export const reactionEntityToForm: Record<ReactionNodeEntity, Array<ReactionFormNode>> = {
  [ReactionNodeEntity.Inputs]: reactionInputs,
  [ReactionNodeEntity.Notes]: reactionNotes,
  [ReactionNodeEntity.Identifiers]: reactionIdentifiers,
  [ReactionNodeEntity.Components]: reactionComponents,
  [ReactionNodeEntity.ComponentPreparations]: reactionComponentsPreparations,
  [ReactionNodeEntity.Features]: reactionData,
  [ReactionNodeEntity.ComponentIdentifiers]: reactionComponentIdentifiers,
  [ReactionNodeEntity.Outcomes]: reactionOutcomes,
  [ReactionNodeEntity.Analyses]: reactionAnalyses,
  [ReactionNodeEntity.Products]: reactionProducts,
  [ReactionNodeEntity.Measurements]: reactionMeasurements,
  [ReactionNodeEntity.CrudeComponents]: reactionCrudeComponents,
};
