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
import type { Optional } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import type { SetupEnumeration, TemplateCSV, VariableMatch } from 'store/entities/enumeration/enumeration.types.ts';
import type { CreateNewDatasetPayload } from 'store/entities/datasets/datasets.types.ts';
import type { UseFormReturnType } from '@mantine/form';

interface DatasetCreation extends Omit<CreateNewDatasetPayload, 'groupId'> {
  groupId: string | null;
}

export interface EnumerationSetupForm extends Omit<SetupEnumeration, 'dataset' | 'templateCSV' | 'matching'> {
  dataset: number | DatasetCreation;
  csvFile: Optional<File | null>;
  templateCSV: Optional<TemplateCSV | null>;
  matching: Array<VariableMatch>;
}

export type EnumerationFormTransform = (values: EnumerationSetupForm) => SetupEnumeration;

export type EnumerationForm = UseFormReturnType<EnumerationSetupForm, EnumerationFormTransform>;
