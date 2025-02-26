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
export interface ReactionEntity {
  id: string;
}

export interface ReactionNamedEntity extends ReactionEntity {
  name: string;
}

export type WithId<T> = T & ReactionEntity;

export type WithoutId<T extends ReactionEntity> = Omit<T, 'id'>;

export type WithIdName<T> = T & ReactionNamedEntity;

export type WithoutIdName<T extends ReactionNamedEntity> = Omit<T, 'id' | 'name'>;
