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
type Primitive = string | number;

export const reversePrimitiveRecord = <Key extends Primitive, Value extends Primitive>(
  record: Record<Key, Value>,
): Record<Value, Key> =>
  (Object.entries(record) as Array<[Key, Value]>).reduce(
    (acc: Record<Value, Key>, [key, value]): Record<Value, Key> => ({
      ...acc,
      [value]: key,
    }),
    {} as Record<Value, Key>,
  );
