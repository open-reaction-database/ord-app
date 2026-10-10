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
/** Whether two arrays hold the same items, by identity, in the same order. */
export function shallowEqualArrays<T>(
  a: ReadonlyArray<T>,
  b: ReadonlyArray<T>,
): boolean {
  return a.length === b.length && a.every((item, index) => Object.is(item, b[index]));
}

/** Whether two records have the same keys, each holding the same value by identity. */
export function shallowEqualRecords<T>(
  a: Readonly<Record<string, T>>,
  b: Readonly<Record<string, T>>,
): boolean {
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every(key => Object.hasOwn(b, key) && Object.is(a[key], b[key]))
  );
}
