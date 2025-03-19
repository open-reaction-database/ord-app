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
import type { ReactionMeasurementType } from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.types.ts';

export const retentionTimeCompatibleTypes: Array<ReactionMeasurementType> = [
  'CUSTOM',
  'IDENTITY',
  'AREA',
  'COUNTS',
  'INTENSITY',
];

export const selectivityCompatibleTypes: Array<ReactionMeasurementType> = ['CUSTOM', 'SELECTIVITY'];

export const waveLengthCompatibleTypes: Array<ReactionMeasurementType> = ['CUSTOM', 'PURITY', 'AREA', 'INTENSITY'];

export const massSpecCompatibleTypes: Array<ReactionMeasurementType> = ['CUSTOM', 'AREA', 'COUNTS', 'INTENSITY'];

export const valueCompatibleTypes: Array<ReactionMeasurementType> = [
  'CUSTOM',
  'YIELD',
  'SELECTIVITY',
  'PURITY',
  'AREA',
  'COUNTS',
  'INTENSITY',
  'AMOUNT',
];
