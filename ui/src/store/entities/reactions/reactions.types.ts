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
import type { AppReactionInput } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import type { ComponentProductPreview, PreviewsById } from './reactionsPreviews/reactionsPreviews.types.ts';
import type { ReactionOutcome } from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.types.ts';
import type { ReactionIdentifier } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import type { ReactionNotes } from 'store/entities/reactions/reactionNotes/reactionNotes.types.ts';

export interface ReactionSummary {
  provenance: Record<string, string | number>;
  summary: Record<string, string | number>;
}

export interface ReactionMolBlocks {
  inputs: Record<string, Array<ComponentProductPreview>>;
  outcomes: Array<{ products: Array<{ molblock: ComponentProductPreview }> }>;
}

export interface ReactionParsedProtobuf extends Omit<ord.IReaction, 'inputs' | 'outcomes' | 'identifiers' | 'notes'> {
  inputs: Record<string, AppReactionInput>;
  outcomes: Array<ReactionOutcome>;
  identifiers: Array<ReactionIdentifier>;
  notes: ReactionNotes;
}

export interface ReactionResponse {
  id: number;
  pb_reaction_id: string;
  is_valid: boolean;
  summary: ReactionSummary;
  binpb: string;
  molblocks: ReactionMolBlocks;
}

export interface ReactionData {
  id: ReactionId;
  data: ReactionParsedProtobuf;
  previews: PreviewsById;
  summary: ReactionSummary;
}

export interface AppReaction extends ReactionData {
  pb_reaction_id: string;
  is_valid: boolean;
}

export interface AppTemplate extends ReactionData {
  name: string;
  variables: Array<unknown>;
}

export type ReactionOrTemplate = AppReaction | AppTemplate;

export interface ReactionWrapper extends Omit<ReactionResponse, 'binpb' | 'molblocks'> {
  data: ReactionParsedProtobuf;
  previews: PreviewsById;
}

export type ReactionId = number | string;

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
