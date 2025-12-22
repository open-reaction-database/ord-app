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
import type { ReactNode } from 'react';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type { RequiredOptionalFieldsProps } from 'common/components/display/RequiredOptionalFields/requiredOptionalFields.types.ts';

interface FieldConfiguration<T> {
  label: string;
  render: (entity: T) => ReactNode;
}

export interface EntityListItemRuntimeProps<T> extends Pick<RequiredOptionalFieldsProps<T>, 'entity'> {
  entityKey: string | number;
}

export interface EntityListItemStaticProps<T> extends Pick<
  RequiredOptionalFieldsProps<T>,
  'requiredFields' | 'optionalFields'
> {
  entityField: string | ReactionPathComponents;
  historyPathComponents?: Array<ReactionPathComponents>;
  title: ((entity: T) => string) | string;
  requiredFields: Array<FieldConfiguration<T>>;
  optionalFields?: Array<FieldConfiguration<T>>;
}

export type EntityListItemProps<T> = EntityListItemStaticProps<T> & EntityListItemRuntimeProps<T>;
