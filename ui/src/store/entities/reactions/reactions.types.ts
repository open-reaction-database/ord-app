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
import type { ord } from 'ord-schema-protobufjs';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type { ReactionInput } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import type { ComponentProductPreview, PreviewsById } from './reactionsPreviews/reactionsPreviews.types.ts';
import type { ReactionOutcome } from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.types.ts';
import type { Optional, ReactionIdentifier } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import type { ReactionNotes } from 'store/entities/reactions/reactionNotes/reactionNotes.types.ts';
import type { Variable } from '../templates/templates.types.ts';

export enum ReactionNodeEntity {
  Inputs = 'inputs',
  Outcomes = 'outcomes',
  Identifiers = 'identifiers',
  Notes = 'notes',
  Components = 'components',
  CrudeComponents = 'crudeComponents',
  ComponentPreparations = 'preparations',
  Features = 'features',
  ComponentIdentifiers = 'component_identifiers',
  Analyses = 'analyses',
  Products = 'products',
  Measurements = 'measurements',
}

export interface ReactionSummary {
  provenance: Record<string, string | number>;
  summary: Record<string, string | number>;
}

export interface ReactionValidation {
  errors: Array<string>;
  warnings: Array<string>;
}

interface ReactionMolBlockProducts {
  molblock: ComponentProductPreview;
  measurements: Array<{
    authentic_standard: { molblock: ComponentProductPreview };
  }>;
}

export interface ReactionMolBlocks {
  inputs: Record<string, Array<ComponentProductPreview>>;
  outcomes: Array<{ products: Array<ReactionMolBlockProducts> }>;
}

export interface AppReaction extends Omit<ord.IReaction, 'inputs' | 'outcomes' | 'identifiers' | 'notes'> {
  inputs: Record<string, ReactionInput>;
  outcomes: Array<ReactionOutcome>;
  identifiers: Array<ReactionIdentifier>;
  notes: ReactionNotes;
}

export interface ReactionResponse {
  id: number;
  pb_reaction_id: string;
  is_valid: boolean;
  summary: ReactionSummary;
  validation: Optional<ReactionValidation>;
  binpb: string;
  molblocks: ReactionMolBlocks;
}

export interface BaseReaction {
  data: AppReaction;
  previews: PreviewsById;
  summary: ReactionSummary;
}

export interface DatasetReaction extends BaseReaction {
  id: number;
  pb_reaction_id: string;
  is_valid: boolean;
  validation: Optional<ReactionValidation>;
}

export interface ReactionTemplate extends BaseReaction {
  id: string;
  name: string;
  variables: Record<string, Variable>;
}

export type ReactionOrTemplate = DatasetReaction | ReactionTemplate;

export type ReactionId = number | string;

export type UpdateReactionSuccessPayload = Omit<DatasetReaction, 'data'>;

export interface ImportReactionFromFilePayload {
  file: File;
}

export interface UpdateReactionPayload {
  reactionId: ReactionId;
  pathComponents: ReactionPathComponents;
}

export interface AddEditReactionFieldPayload extends UpdateReactionPayload {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newValue: any;
}
