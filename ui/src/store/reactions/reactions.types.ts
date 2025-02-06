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
import type OrdSchema from 'ord-schema';
import type { ord } from 'ord-schema-protobufjs';

export interface ReactionSummary {
  provenance: Record<string, string | number>;
  summary: Record<string, string | number>;
}

export interface ReactionMolBlocks {
  products: Array<string>;
  inputs: Record<string, Array<string>>;
}

export interface ReactionResponse {
  id: number;
  pb_reaction_id: string;
  summary: ReactionSummary;
  binpb: string;
  mulblocks: ReactionMolBlocks;
}

export type Reaction = ReturnType<ReturnType<typeof OrdSchema.Reaction.deserializeBinary>['toObject']>;

export interface ReactionWrapper extends Omit<ReactionResponse, 'binpb'> {
  data: ord.IReaction;
}

export interface ImportReactionFromFilePayload {
  file: File;
}
