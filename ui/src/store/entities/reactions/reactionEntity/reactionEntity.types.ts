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
  CompoundIdentifierType,
  ReactionAdditionDeviceType,
  ReactionFlowRateType,
  ReactionIdentifierType,
  ReactionMassSpecType,
  ReactionPressureType,
  ReactionSelectivityType,
  ReactionSpeedType,
  ReactionTemperatureType,
  ReactionTextureType,
  ReactionTimeType,
  ReactionWaveLengthType,
  ReactionLengthType,
  ReactionCurrentType,
  ReactionTemperatureControlType,
  PressureControlType,
  ReactionAtmosphereType,
  StirringRateType,
  VoltageUnit,
  ElectrochemistryCellType,
  TubingType,
} from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.types.ts';
import type { ord } from 'ord-schema-protobufjs';

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

export enum ReactionBoolean {
  Unspecified = 'Unspecified',
  True = 'True',
  False = 'False',
}

export type OrdOptional<T> = T | null | undefined;
export type Optional<T> = T | null;

export interface OrdTypeDetails {
  type?: Optional<number>;
  details?: Optional<string>;
}

export interface ReactionTypeDetails<T extends string> {
  type: T;
  details: Optional<string>;
}

export interface OrdValuePrecisionUnit {
  value?: Optional<number>;
  precision?: Optional<number>;
  units?: Optional<number>;
}

export interface ReactionValuePrecisionUnit<T extends string> {
  units: T;
  value: Optional<number>;
  precision: Optional<number>;
}

export type ReactionSpeed = ReactionTypeDetails<ReactionSpeedType>;

export type ReactionTime = ReactionValuePrecisionUnit<ReactionTimeType>;

export type ReactionFlowRate = ReactionValuePrecisionUnit<ReactionFlowRateType>;

export type ReactionAdditionDevice = ReactionTypeDetails<ReactionAdditionDeviceType>;

export type ReactionTemperature = ReactionValuePrecisionUnit<ReactionTemperatureType>;

export type ReactionPressure = ReactionValuePrecisionUnit<ReactionPressureType>;

export type ReactionTexture = ReactionTypeDetails<ReactionTextureType>;

export type ReactionIdentifier = WithId<{
  type: ReactionIdentifierType;
  value: Optional<string>;
  details: Optional<string>;
}>;

export type ReactionSelectivity = ReactionTypeDetails<ReactionSelectivityType>;

export type ReactionWaveLength = ReactionValuePrecisionUnit<ReactionWaveLengthType>;

export type ReactionLength = ReactionValuePrecisionUnit<ReactionLengthType>;

export type ReactionCurrent = ReactionValuePrecisionUnit<ReactionCurrentType>;

export type ReactionMassSpec = Omit<ord.ProductMeasurement.IMassSpecMeasurementDetails, 'type' | 'eicMasses'> & {
  type: ReactionMassSpecType;
  eicMasses: Array<number>;
};

export interface ReactionCompoundIdentifier extends WithId<Omit<ord.ICompoundIdentifier, 'type'>> {
  type: CompoundIdentifierType;
}

export type ReactionDateTime = string | null;

export type TemperatureControl = ReactionTypeDetails<ReactionTemperatureControlType>;

export type PressureControl = ReactionTypeDetails<PressureControlType>;

export type ReactionAtmosphere = ReactionTypeDetails<ReactionAtmosphereType>;

export interface StirringRate extends Pick<ord.StirringConditions.IStirringRate, 'details' | 'rpm'> {
  type: StirringRateType;
}

export type Voltage = ReactionValuePrecisionUnit<VoltageUnit>;

export type ElectrochemistryCell = ReactionTypeDetails<ElectrochemistryCellType>;

export interface Tubing extends Pick<ord.FlowConditions.ITubing, 'details'> {
  type: TubingType;
  diameter: ReactionLength;
}
