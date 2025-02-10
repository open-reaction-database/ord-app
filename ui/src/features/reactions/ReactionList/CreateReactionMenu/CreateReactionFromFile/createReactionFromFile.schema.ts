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

const MAX_FILE_SIZE = 1024 * 1024 * 15;

const MAX_FILE_SIZE_MB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(2);

export const createReactionFromFileSchema = yup.object({
  file: yup
    .mixed()
    .required('Reaction file is required')
    .label('File')
    .test({
      message: `Filesize cannot exceed ${MAX_FILE_SIZE_MB} MB`,
      test: value => {
        const file = value as File;
        return file?.size < MAX_FILE_SIZE;
      },
    }),
});

export type CreateReactionFromFileFormValues = yup.InferType<typeof createReactionFromFileSchema>;
