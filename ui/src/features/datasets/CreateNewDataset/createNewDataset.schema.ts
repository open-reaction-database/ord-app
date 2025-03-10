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

export const createNewDatasetSchema = yup.object({
  name: yup
    .string()
    .label('Dataset name')
    .required('')
    .test(
      'no-only-spaces',
      'Dataset name cannot be just spaces',
      value => value === undefined || value === '' || value.trim().length > 0,
    ),
  groupId: yup.string().required(),
  description: yup.string().label('Description').required(),
});

export type CreateNewDatasetFormValues = yup.InferType<typeof createNewDatasetSchema>;
