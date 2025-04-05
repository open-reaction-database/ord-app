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
import {
  massSpecCompatibleTypes,
  retentionTimeCompatibleTypes,
  selectivityCompatibleTypes,
  valueCompatibleTypes,
  waveLengthCompatibleTypes,
} from 'features/reactions/ReactionEntities/entityFormConfiguration/measurements/reactionMeasurements.constants.ts';
import { ReactionBoolean } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';

export const measurementTransform = (measurement: ReactionMeasurement): ReactionMeasurement => {
  const authenticStandard: Partial<ReactionMeasurement> =
    measurement.usesAuthenticStandard === ReactionBoolean.True ? {} : { authenticStandard: null };

  return {
    ...measurement,
    retentionTime: retentionTimeCompatibleTypes.includes(measurement.type) ? measurement.retentionTime : null,
    selectivity: selectivityCompatibleTypes.includes(measurement.type) ? measurement.selectivity : null,
    waveLength: waveLengthCompatibleTypes.includes(measurement.type) ? measurement.waveLength : null,
    massSpecDetails: massSpecCompatibleTypes.includes(measurement.type) ? measurement.massSpecDetails : null,
    value: valueCompatibleTypes.includes(measurement.type) ? measurement.value : null,
    ...authenticStandard,
  };
};
