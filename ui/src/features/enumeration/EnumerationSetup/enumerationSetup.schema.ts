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
import * as yup from 'yup';
import { requiredTextField } from 'common/utils/requiredTextField.schema.ts';

export const enumerationSetupSchemaBase = yup.object({
  templateId: yup.string().required().label('Template'),
  csvFile: yup.mixed().required().label('CSV File'),
  matching: yup.array().of(
    yup.object({
      variable: yup.string().required().label('Variable Name'),
      csvColumn: yup.string().required().label('CSV Column'),
    }),
  ),
});

export const enumerationSetupNewDatasetSchema = enumerationSetupSchemaBase.shape({
  dataset: yup.object({
    groupId: yup.number().required().label('Group'),
    name: requiredTextField('Name'),
    description: requiredTextField('Description'),
  }),
});

export const enumerationSetupExistingDatasetSchema = enumerationSetupSchemaBase.shape({
  dataset: yup.number().required(),
});
