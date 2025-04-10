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
import type { ReactionMeasurement } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { MeasurementConstants } from 'store/entities/reactions/reactionsMeasurement/reactionMeasurements.constants.ts';
import { ReactionBoolean } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import type { ReactionMeasurementType } from '../reactionEntityTypes/reactionEntityTypes.types.ts';
import { clearDependantFields } from 'store/utils/clearDependantFields.ts';

const createPredicate = (types: Array<ReactionMeasurementType>) => (workup: ReactionMeasurement) =>
  types.includes(workup.type);

export const measurementTransform = (measurement: ReactionMeasurement): ReactionMeasurement => {
  return clearDependantFields<ReactionMeasurement>(measurement, [
    ['authenticStandard', measurement => measurement.usesAuthenticStandard === ReactionBoolean.True],
    ['retentionTime', createPredicate(MeasurementConstants.retentionTimeCompatibleTypes)],
    ['selectivity', createPredicate(MeasurementConstants.selectivityCompatibleTypes)],
    ['waveLength', createPredicate(MeasurementConstants.waveLengthCompatibleTypes)],
    ['massSpecDetails', createPredicate(MeasurementConstants.massSpecCompatibleTypes)],
    ['value', createPredicate(MeasurementConstants.valueCompatibleTypes)],
  ]);
};
