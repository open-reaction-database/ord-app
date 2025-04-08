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

export interface TemperatureMeasurement
  extends WithId<Pick<ord.TemperatureConditions.ITemperatureMeasurement, 'details'>> {
  type: TemperatureMeasurementType;
  time: ReactionTime;
  temperature: ReactionTemperature;
}

export interface PressureMeasurement extends WithId<Pick<ord.PressureConditions.IPressureMeasurement, 'details'>> {
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

export interface ReactionStirringCondition extends Pick<ord.IStirringConditions, 'details'> {
  type: ReactionStirringMethodType;
  rate: StirringRate;
}

export interface ReactionIlluminationCondition extends Pick<ord.IIlluminationConditions, 'details' | 'color'> {
  type: ReactionIlluminationType;
  peakWavelength: ReactionWaveLength;
  distanceToVessel: ReactionLength;
}

export interface ReactionElectrochemistryCondition
  extends Pick<ord.IElectrochemistryConditions, 'details' | 'anodeMaterial' | 'cathodeMaterial'> {
  type: ElectrochemistryType;
  current: ReactionCurrent;
  voltage: Voltage;
  electrodeSeparation: ReactionLength;
  cell: ElectrochemistryCell;
  electrochemistryMeasurements: Array<ElectrochemistryMeasurement>;
}

export interface ReactionFlowCondition extends Pick<ord.IFlowConditions, 'details' | 'pumpType'> {
  type: ReactionFlowType;
  tubing: Tubing;
}

export interface ReactionConditions extends WithId<Pick<ord.IReactionConditions, 'details' | 'ph'>> {
  temperature: ReactionTemperatureCondition;
  pressure: ReactionPressureCondition;
  stirring: ReactionStirringCondition;
  illumination: ReactionIlluminationCondition;
  electrochemistry: ReactionElectrochemistryCondition;
  flow: ReactionFlowCondition;
  reflux: ReactionBoolean;
  conditionsAreDynamic: ReactionBoolean;
}
