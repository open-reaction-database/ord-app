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
  CompoundPreparationType,
  ReactionMeasurementType,
  ReactionRole,
} from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.types.ts';
import type {
  Optional,
  OrdOptional,
  ReactionBoolean,
  ReactionCompoundIdentifier,
  ReactionMassSpec,
  ReactionSelectivity,
  ReactionTexture,
  ReactionTime,
  ReactionWaveLength,
  WithId,
} from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import type { ord } from 'ord-schema-protobufjs';
import type { ReactionAmount } from 'store/entities/reactions/reactionAmount/reactionAmount.types.ts';
import type { AppData } from 'store/entities/reactions/reactionData/reactionData.types.ts';

export type OrdComponentBase = Pick<ord.ICompound, 'identifiers' | 'reactionRole' | 'texture' | 'features'> &
  Pick<ord.IProductCompound, 'identifiers' | 'reactionRole' | 'texture' | 'features'>;

export type ReactionComponentBase = WithId<{
  identifiers: Array<ReactionCompoundIdentifier>;
  molBlockIdentifiers: Array<ReactionCompoundIdentifier>;
  reactionRole: ReactionRole;
  texture: ReactionTexture;
  features: Record<string, AppData>;
}>;

export interface ReactionComponentPreparation extends WithId<Omit<ord.ICompoundPreparation, 'type'>> {
  type: CompoundPreparationType;
}

export interface ReactionInputComponent extends ReactionComponentBase, Pick<ord.ICompound, 'source'> {
  isLimiting: ReactionBoolean;
  amount: ReactionAmount;
  preparations: Array<ReactionComponentPreparation>;
}

export interface ReactionMeasurementAnalysis {
  name: string;
  id: string | null;
}

export enum ReactionMeasurementValueType {
  Percent = '%',
  Number = 'Number',
  String = 'String',
  Mass = 'Mass',
}

export interface ReactionMeasurementValueNumber {
  type: ReactionMeasurementValueType.Number | ReactionMeasurementValueType.Percent;
  value: {
    value?: OrdOptional<number>;
    precision?: OrdOptional<number>;
  };
}

export interface ReactionMeasurementValueString {
  type: ReactionMeasurementValueType.String;
  value: string;
}

export interface ReactionMeasurementValueMass {
  type: ReactionMeasurementValueType.Mass;
  value: ReactionAmount;
}

export type ReactionMeasurementValue =
  | ReactionMeasurementValueNumber
  | ReactionMeasurementValueString
  | ReactionMeasurementValueMass;

export interface ReactionMeasurement extends WithId<Pick<ord.IProductMeasurement, 'details'>> {
  analysis: Optional<ReactionMeasurementAnalysis>;
  type: ReactionMeasurementType;
  usesAuthenticStandard: ReactionBoolean;
  usesInternalStandard: ReactionBoolean;
  isNormalized: ReactionBoolean;
  value: Optional<ReactionMeasurementValue>;
  retentionTime: Optional<ReactionTime>;
  selectivity: Optional<ReactionSelectivity>;
  waveLength: Optional<ReactionWaveLength>;
  massSpecDetails: Optional<ReactionMassSpec>;
  authenticStandard: Optional<ReactionInputComponent>;
}

export interface ReactionProduct extends ReactionComponentBase, Pick<ord.IProductCompound, 'isolatedColor'> {
  isDesiredProduct: ReactionBoolean;
  measurements: Array<ReactionMeasurement>;
}
