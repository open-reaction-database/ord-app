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
import type { ord } from 'ord-schema-protobufjs';
import { withId } from '../reactionEntity/reactionEntity.converters';

export interface ReactionConditions {
  id: string;
  details: string | null;
  ph: number | null;
}

export const ordConditionsToReactionConditions = (
  conditions: ord.IReactionConditions | null | undefined,
): Array<ReactionConditions> => {
  if (!conditions) return [];
  const base: ReactionConditions = {
    id: '',
    details: conditions.details ?? '',
    ph: conditions.ph ?? 0,
  };
  return [withId(base)];
};

export const reactionConditionsToOrdConditions = (
  conditions: Array<ReactionConditions>,
): ord.IReactionConditions | undefined => {
  if (conditions.length === 0) return undefined;
  const condition = conditions[0];
  return {
    details: condition.details,
    ph: condition.ph,
  };
};
