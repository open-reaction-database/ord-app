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
import type {
  ReactionParsedProtobuf,
  ReactionSummary,
  ReactionMolBlocks,
  ReactionId,
} from '../reactions/reactions.types';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents';

export type ComponentProductPreview = string | null;

export type PreviewsById = Record<string, ComponentProductPreview>;

export interface Variable {
  id: string;
  name: string;
  pathComponents: ReactionPathComponents;
}

export interface TemplateCreator {
  reactionId: number;
  name: string;
}

export interface Template {
  id: number;
  name: string;
  binpb: string;
  variables: string;
  summary: ReactionSummary;
  molblocks: ReactionMolBlocks;
}

export interface SaveAsTemplatePayload {
  reaction: string;
  name: string;
}

export interface TemplateWrapper extends Omit<Template, 'binpb' | 'molblocks'> {
  data: ReactionParsedProtobuf;
  previews: PreviewsById;
}

export interface UpdateTemplatePayload {
  templateId: ReactionId;
  pathComponents: ReactionPathComponents;
}

export interface AddEditTemplateFieldPayload extends UpdateTemplatePayload {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newValue: any;
}
