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
import type {
  ReactionEntity,
  ReactionNamedEntity,
  WithId,
  WithIdName,
  WithoutId,
  WithoutIdName,
} from './reactionEntity.types';

export function withId<T>(entity: T): WithId<T> {
  return {
    ...entity,
    id: crypto.randomUUID(),
  };
}

export function withoutId<T extends ReactionEntity>(entity: T): WithoutId<T> {
  const { id: _, ...rest } = entity;
  return rest;
}

export function withIdName<T>(entity: T, name: string): WithIdName<T> {
  return {
    ...entity,
    id: crypto.randomUUID(),
    name: name,
  };
}

export function withoutIdName<T extends ReactionNamedEntity>(entity: T): WithoutIdName<T> {
  const { id: _i, name: _n, ...rest } = entity;
  return rest;
}
