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
type IsNull<T, K> = T extends null ? K : never;

type NullableKeys<T> = {
  [K in keyof T]: IsNull<T[K], K>;
}[keyof T];

type FieldNamePredicate<T, K> = [K, (object: T) => boolean];

export function clearDependantFields<T>(
  object: T,
  fieldsConfiguration: Array<FieldNamePredicate<T, NullableKeys<T>>>,
): T {
  const objectCopy: T = { ...object };

  fieldsConfiguration.forEach(([field, predicate]) => {
    if (!predicate(objectCopy)) {
      objectCopy[field] = null as (typeof objectCopy)[typeof field];
    }
  });
  return objectCopy;
}
