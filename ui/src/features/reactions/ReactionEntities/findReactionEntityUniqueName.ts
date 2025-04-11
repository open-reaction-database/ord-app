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

const nameWithSpace = (entityName: string, counter: number): string => `${entityName} ${counter}`;

const nameWithoutSpace = (entityName: string, counter: number): string => `${entityName}${counter}`;

export function findReactionEntityUniqueName(
  entityName: string,
  names: Array<string>,
  includeSpace: boolean = true,
): string {
  let counter = 1;
  let isValid = false;
  const generateName = includeSpace ? nameWithSpace : nameWithoutSpace;
  let newUniqueName: string = generateName(entityName, counter);
  while (!isValid) {
    newUniqueName = generateName(entityName, counter);
    isValid = names.every(existingName => existingName !== newUniqueName);
    counter++;
  }
  return newUniqueName;
}
