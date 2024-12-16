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
import { Reaction } from '../model/reaction';

/**
 * Generates an array of mock reactions
 *
 * @param count - The number of reactions to generate
 * @returns
 */
export function generateMockReactions(count: number): Reaction[] {
  const generateName = () => (Math.random() > 0.5 ? faker.science.chemicalElement().name + ' reaction' : undefined);

  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: generateName(),
    summary: faker.lorem.sentence().slice(0, 30),
    conditions: faker.lorem.sentence().slice(0, 30),
    analysis: faker.lorem.sentence().slice(0, 30),
  }));
}
