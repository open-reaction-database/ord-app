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
import type { Optional } from '../reactions/reactionEntity/reactionEntity.types.ts';
import type { CreateNewDatasetPayload } from '../datasets/datasets.types.ts';
import type { ReactionTemplate } from '../reactions/reactions.types.ts';
import type { Variable } from '../templates/templates.types.ts';

export type TemplateCSVRow = Record<string, string | boolean | number>;

export interface TemplateCSV {
  headers: Array<string>;
  content: Array<TemplateCSVRow>;
}

export interface VariableMatch {
  variable: string;
  csvColumn: Optional<string>;
}

export interface EnumerationBase {
  dataset: number | CreateNewDatasetPayload;
  matching: Array<Required<VariableMatch>>;
  templateCSV: TemplateCSV;
}

export interface SetupEnumeration extends EnumerationBase {
  templateId: string;
}

type TemplateInformation = Pick<ReactionTemplate, 'data'> & {
  variables: Array<Variable>;
};

export type StartEnumeration = EnumerationBase & TemplateInformation;

export interface EnumerationBatchRequest extends TemplateInformation, Pick<EnumerationBase, 'matching'> {
  templateCSV: TemplateCSV;
  index: number;
}

export interface EnumerationError {
  line: number;
  message: string;
}

export interface EnumerationBatchResult {
  reactions: Array<string>;
  errors: Array<EnumerationError>;
}

export interface EnumerationProgress extends StartEnumeration, EnumerationBatchResult {
  index: number;
  finished: boolean;
  resultDatasetId: number | null;
}
