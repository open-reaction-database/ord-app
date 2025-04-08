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
  ReactionLength,
  OrdOptional,
  ReactionCurrent,
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

interface BaseReactionCondition {
  generalDetails: OrdOptional<string>;
  id: string;
  reflux: ReactionBoolean;
  conditionsAreDynamic: ReactionBoolean;
}

export interface ReactionTemperatureCondition {
  temperature: ReactionTemperature;
  temperatureControl: ReactionTemperatureControlType;
  temperatureDetails: OrdOptional<string>;
}

export interface ReactionPressureCondition {
  pressure: ReactionPressure;
  pressureControlDetails: string;
  atmosphere: ReactionAtmosphereType;
  atmosphereDetails: OrdOptional<string>;
}

export interface ReactionStirringCondition {
  stirringMethod: ReactionStirringMethodType;
  stirringDetails: OrdOptional<string>;
  rate: ReactionStirringRateType;
  rateDetails: OrdOptional<string>;
  rpm: OrdOptional<string>;
}

export interface ReactionIlluminationCondition {
  illuminationType: ReactionIlluminationType;
  illuminationDetails: OrdOptional<string>;
  peakWavelength: ReactionWaveLength;
  color: OrdOptional<string>;
  distanceToVessel: ReactionLength;
}

export interface ReactionElectrochemistryCondition {
  electrochemistryType: ReactionElectrochemistryType;
  electrochemistryDetails: OrdOptional<string>;
  current: ReactionCurrent;
  anode: OrdOptional<string>;
  cathode: OrdOptional<string>;
  separation: ReactionLength;
  cell: ReactionElectrochemistryCellType;
  separationDetails: OrdOptional<string>;
}

export interface ReactionFlowCondition {
  flowType: ReactionFlowType;
  flowDetails: OrdOptional<string>;
  pumpType: OrdOptional<string>;
  tubing: ReactionTubingType;
  tubingDetails: OrdOptional<string>;
  diameter: ReactionLength;
}

type DetailsFields = {
  temperatureDetails: OrdOptional<string>;
  pressureControlDetails: OrdOptional<string>;
  atmosphereDetails: OrdOptional<string>;
  stirringDetails: OrdOptional<string>;
  rateDetails: OrdOptional<string>;
  illuminationDetails: OrdOptional<string>;
  electrochemistryDetails: OrdOptional<string>;
  separationDetails: OrdOptional<string>;
  flowDetails: OrdOptional<string>;
  tubingDetails: OrdOptional<string>;
};

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
  | 'details'
> &
  BaseReactionCondition &
  Pick<ReactionTemperatureCondition, 'temperature' | 'temperatureControl'> &
  Pick<ReactionPressureCondition, 'pressure' | 'atmosphere'> &
  Pick<ReactionStirringCondition, 'stirringMethod' | 'rate' | 'rpm'> &
  Pick<ReactionIlluminationCondition, 'illuminationType' | 'peakWavelength' | 'color' | 'distanceToVessel'> &
  Pick<
    ReactionElectrochemistryCondition,
    'electrochemistryType' | 'current' | 'anode' | 'cathode' | 'separation' | 'cell'
  > &
  Pick<ReactionFlowCondition, 'flowType' | 'pumpType' | 'tubing' | 'diameter'> &
  DetailsFields;
