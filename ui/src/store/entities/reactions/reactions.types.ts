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

export interface ReactionSummary {
  provenance: Record<string, string | number>;
  summary: Record<string, string | number>;
}

export interface ReactionMolBlocks {
  products: Array<string>;
  inputs: Record<string, Array<string>>;
}

export interface AppReaction extends Omit<ord.IReaction, 'inputs'> {
  inputs: Record<string, AppReactionInput>;
}

export interface ReactionResponse {
  id: number;
  pb_reaction_id: string;
  summary: ReactionSummary;
  binpb: string;
  molblocks: ReactionMolBlocks;
}

export interface ReactionWrapper extends Omit<ReactionResponse, 'binpb'> {
  data: AppReaction;
}

export interface ImportReactionFromFilePayload {
  file: File;
}

export interface UpdateReactionPayload {
  reactionId: number;
  pathComponents: ReactionPathComponents;
}

export interface AddEditReactionFieldPayload extends UpdateReactionPayload {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newValue: any;
}
