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
import { faker } from '@faker-js/faker';
import type { DatasetTableRow } from '../../pages/DatasetTable/DatasetTable';
import { DATASET_STATUS } from '../model/datasetStatus';

/**
 * Generates an array of mock datasets
 *
 * @param count - The number of datasets to generate
 * @returns
 */
export function generateMockDatasets(count: number): DatasetTableRow[] {
  const statusValues = Object.values(DATASET_STATUS);

  return Array.from({ length: count }, () => ({
    datasetName: `${faker.number.int({ min: 100, max: 999 })} ${faker.company.name()} dataset`.slice(0, 20),
    size: faker.number.int({ min: 10, max: 10000 }),
    status: faker.helpers.arrayElement(statusValues),
    group: `Group ${faker.number.int({ min: 1, max: 5 })}`,
    owner: `${faker.person.firstName().slice(0, 5)} ${faker.person.lastName().slice(0, 5)}`,
    lastModified: faker.date.recent().toISOString(),
    description: faker.lorem.sentence().slice(0, 20),
  }));
}
