/*
 * Copyright 2026 Open Reaction Database Project Authors
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
import { describe, it, expect } from 'vitest';
import { editDatasetSchema } from 'features/datasets/DatasetHeader/EditDataset/editDataset.schema.ts';

describe('editDatasetSchema', () => {
  it('accepts a name and description', async () => {
    await expect(editDatasetSchema.validate({ name: 'My dataset', description: 'notes' })).resolves.toEqual({
      name: 'My dataset',
      description: 'notes',
    });
  });

  it('requires the name', async () => {
    await expect(editDatasetSchema.validate({ name: '', description: 'notes' })).rejects.toThrow(
      'Dataset name should not be empty',
    );
  });

  it('requires the description', async () => {
    await expect(editDatasetSchema.validate({ name: 'My dataset', description: '   ' })).rejects.toThrow(
      'Description should not be empty',
    );
  });
});
