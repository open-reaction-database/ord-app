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

const templateVariableEditSchema = yup
  .string()
  .required()
  .label('Variable name')
  .matches(/^[a-zA-Z0-9]+$/, {
    message: 'Variable name should contain only letters and numbers',
  });

export function useTemplateVariableEditSchema(restrictedNames: Array<string>) {
  return templateVariableEditSchema.test(
    'restricted-names',
    'Variable name should be unique across the whole template',
    value => !restrictedNames.includes(value),
  );
}
