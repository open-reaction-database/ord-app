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
import type { OrdOptional } from '#reaction/model/reactionEntity/reactionEntity.types.ts';

const ENUM_UNSPECIFIED_VALUE = 0;

type ObjectValue = OrdOptional<number | string | Array<unknown> | boolean | object>;

export function convertObjectToUndefinedIfEmpty<T extends Record<string, ObjectValue>>(
  object: T,
  enumKeys: Array<keyof T> = [],
): T | undefined {
  const isEmpty = Object.keys(object).every(key => {
    const value = object[key];
    if (enumKeys.includes(key) && value === ENUM_UNSPECIFIED_VALUE) {
      return true;
    }
    return value === undefined || value === null || value === '';
  });
  return isEmpty ? undefined : object;
}
