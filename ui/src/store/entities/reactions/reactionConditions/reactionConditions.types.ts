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
import type {
  ReactionBoolean,
  ReactionTemperature,
  ReactionPressure,
  ReactionWaveLength,
} from '../reactionEntity/reactionEntity.types';
import type {
  ReactionTemperatureControlType,
  ReactionAtmosphereType,
  ReactionStirringMethodType,
  ReactionStirringRateType,
  ReactionIlluminationType,
  ReactionElectrochemistryType,
  ReactionElectrochemistryCellType,
  ReactionFlowType,
  ReactionTubingType,
} from '../reactionEntityTypes/reactionEntityTypes.types';

export interface ReactionTemperatureCondition {
  temperature: ReactionTemperature;
  temperatureControl: ReactionTemperatureControlType;
  temperatureDetails: string | null;
}

export interface ReactionPressureCondition {
  pressure: ReactionPressure;
  pressureControlDetails: string;
  atmosphere: ReactionAtmosphereType;
  atmosphereDetails: string | null;
}

export interface ReactionStirringCondition {
  stirringMethod: ReactionStirringMethodType;
  stirringDetails: string | null;
  rate: ReactionStirringRateType;
  rateDetails: string | null;
  rpm: string;
}

export interface ReactionIlluminationCondition {
  illuminationType: ReactionIlluminationType;
  illuminationDetails: string | null;
  peakWavelength: ReactionWaveLength;
  color: string | null;
  distanceToVessel: ReactionWaveLength;
}

export interface ReactionElectrochemistryCondition {
  electrochemistryType: ReactionElectrochemistryType;
  electrochemistryDetails: string | null;
  current: ReactionWaveLength;
  anode: string | null;
  cathode: string | null;
  separation: ReactionWaveLength;
  cell: ReactionElectrochemistryCellType;
  separationDetails: string | null;
}

export interface ReactionFlowCondition {
  flowType: ReactionFlowType;
  flowDetails: string | null;
  pumpType: string | null;
  tubing: ReactionTubingType;
  tubingDetails: string | null;
  diameter: ReactionWaveLength;
}

export type ReactionConditions = Omit<
  ord.IReactionConditions,
  | 'reflux'
  | 'conditionsAreDynamic'
  | 'temperature'
  | 'pressure'
  | 'stirring'
  | 'illumination'
  | 'electrochemistry'
  | 'flow'
> & {
  id: string;
  generalDetails: string | null;
  reflux: ReactionBoolean;
  conditionsAreDynamic: ReactionBoolean;
} & ReactionTemperatureCondition &
  ReactionPressureCondition &
  ReactionStirringCondition &
  ReactionIlluminationCondition &
  ReactionElectrochemistryCondition &
  ReactionFlowCondition;
