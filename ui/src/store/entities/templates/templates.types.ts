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
import type { AppReactionInput } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import type { ReactionOutcome } from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.types.ts';
import type { ReactionIdentifier } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';

export type ComponentProductPreview = string | null;

export type PreviewsById = Record<string, ComponentProductPreview>;

export interface TemplateCreator {
  reactionId: number;
  name: string;
  variables: string;
}

export interface Template {
  id: number;
  name: string;
  binpb: string;
  variables: string;
}

export interface SaveAsTemplatePayload {
  reaction: string;
  name: string;
}

export interface AppTemplate extends Omit<ord.IReaction, 'inputs' | 'outcomes' | 'identifiers'> {
  inputs: Record<string, AppReactionInput>;
  outcomes: Array<ReactionOutcome>;
  identifiers: Array<ReactionIdentifier>;
}

export interface TemplateWrapper extends Omit<Template, 'binpb'> {
  data: AppTemplate;
  previews: PreviewsById;
}
