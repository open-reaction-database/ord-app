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
  Optional,
  ReactionBoolean,
  ReactionTemperature,
  ReactionPressure,
  ReactionWaveLength,
  ReactionLength,
  ReactionCurrent,
  WithId,
  TemperatureControl,
  PressureControl,
  ReactionAtmosphere,
  StirringRate,
  Voltage,
  ElectrochemistryCell,
  Tubing,
  ReactionTime,
} from '../reactionEntity/reactionEntity.types';
import type {
  ReactionStirringMethodType,
  ReactionIlluminationType,
  ElectrochemistryType,
  ReactionFlowType,
  TemperatureMeasurementType,
  PressureMeasurementType,
} from '../reactionEntityTypes/reactionEntityTypes.types';

export interface TemperatureMeasurement extends WithId<object> {
  details?: Optional<string>;
  type: TemperatureMeasurementType;
  time: ReactionTime;
  temperature: ReactionTemperature;
}

export interface PressureMeasurement extends WithId<object> {
  details?: Optional<string>;
  type: PressureMeasurementType;
  time: ReactionTime;
  pressure: ReactionPressure;
}

export interface ElectrochemistryMeasurement extends WithId<object> {
  time: ReactionTime;
  current: ReactionCurrent;
  voltage: Voltage;
}

export interface ReactionTemperatureCondition {
  control: TemperatureControl;
  setpoint: ReactionTemperature;
  temperatureMeasurements: Array<TemperatureMeasurement>;
}

export interface ReactionPressureCondition {
  control: PressureControl;
  setpoint: ReactionPressure;
  atmosphere: ReactionAtmosphere;
  pressureMeasurements: Array<PressureMeasurement>;
}

export interface ReactionStirringCondition {
  details?: Optional<string>;
  type: ReactionStirringMethodType;
  rate: StirringRate;
}

export interface ReactionIlluminationCondition {
  details?: Optional<string>;
  color?: Optional<string>;
  type: ReactionIlluminationType;
  peakWavelength: ReactionWaveLength;
  distanceToVessel: ReactionLength;
}

export interface ReactionElectrochemistryCondition {
  details?: Optional<string>;
  anodeMaterial?: Optional<string>;
  cathodeMaterial?: Optional<string>;
  type: ElectrochemistryType;
  current: ReactionCurrent;
  voltage: Voltage;
  electrodeSeparation: ReactionLength;
  cell: ElectrochemistryCell;
  electrochemistryMeasurements: Array<ElectrochemistryMeasurement>;
}

export interface ReactionFlowCondition {
  details?: Optional<string>;
  pumpType?: Optional<string>;
  type: ReactionFlowType;
  tubing: Tubing;
}

export interface ReactionConditions extends WithId<object> {
  details?: Optional<string>;
  ph?: Optional<number>;
  temperature: ReactionTemperatureCondition;
  pressure: ReactionPressureCondition;
  stirring: ReactionStirringCondition;
  illumination: ReactionIlluminationCondition;
  electrochemistry: ReactionElectrochemistryCondition;
  flow: ReactionFlowCondition;
  reflux: ReactionBoolean;
  conditionsAreDynamic: ReactionBoolean;
}
