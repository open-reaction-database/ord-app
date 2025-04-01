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
import {
  type ReactionMassSpec,
  type OrdValuePrecisionUnit,
  type ReactionValuePrecisionUnit,
  type ReactionEntity,
  type ReactionNamedEntity,
  type WithId,
  type WithIdName,
  type WithoutId,
  type WithoutIdName,
  type Optional,
  type OrdOptional,
  type OrdTypeDetails,
  type ReactionTypeDetails,
  type ReactionIdentifier,
  type ReactionCompoundIdentifier,
  ReactionBoolean,
} from './reactionEntity.types';
import {
  ordAdditionDeviceTypeToReaction,
  ordAdditionSpeedTypeToReaction,
  ordCompoundIdentifierTypeToReaction,
  ordFlowRateTypeToReaction,
  ordMassSpecTypeToReaction,
  ordReactionIdentifierTypeToReaction,
  ordSelectivityTypeToReaction,
  ordTemperatureTypeToReaction,
  ordTextureTypeToReaction,
  ordTimeTypeToReaction,
  ordWaveLengthTypeToReaction,
  reactionAdditionDeviceTypeToOrd,
  reactionAdditionSpeedTypeToOrd,
  reactionCompoundIdentifierTypeToOrd,
  reactionFlowRateTypeToOrd,
  reactionIdentifierTypeToOrd,
  reactionMassSpecTypeToOrd,
  reactionSelectivityTypeToOrd,
  reactionTemperatureTypeToOrd,
  reactionTextureTypeToOrd,
  reactionTimeTypeToOrd,
  reactionWaveLengthTypeToOrd,
} from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.converters.ts';
import type { ord } from 'ord-schema-protobufjs';

export function withId<T>(entity: T): WithId<T> {
  return {
    ...entity,
    id: crypto.randomUUID(),
  };
}

export function withoutId<T extends ReactionEntity>(entity: T): WithoutId<T> {
  const { id: _, ...rest } = entity;
  return rest;
}

export function withIdName<T>(entity: T, name: string): WithIdName<T> {
  return {
    ...entity,
    id: crypto.randomUUID(),
    name: name,
  };
}

export function withoutIdName<T extends ReactionNamedEntity>(entity: T): WithoutIdName<T> {
  const { id: _i, name: _n, ...rest } = entity;
  return rest;
}

export function ordBooleanToReaction(value?: boolean | null): ReactionBoolean {
  if (value === undefined || value === null) {
    return ReactionBoolean.Unspecified;
  }
  return value ? ReactionBoolean.True : ReactionBoolean.False;
}

export function reactionBooleanToOrd(value: ReactionBoolean): boolean | null {
  switch (value) {
    case ReactionBoolean.Unspecified:
      return null;
    case ReactionBoolean.True:
      return true;
    case ReactionBoolean.False:
      return false;
  }
}

const generateValuePrecisionUnitConverter = <T extends string>(
  typeFromOrd: (value: OrdOptional<number>) => T,
  typeToOrd: (value: T) => OrdOptional<number>,
) => ({
  fromOrd: (ordValue: OrdOptional<OrdValuePrecisionUnit>): ReactionValuePrecisionUnit<T> => {
    const { value, precision, units } = ordValue ?? {};
    return {
      value: value ?? null,
      precision: precision ?? null,
      units: typeFromOrd(units),
    };
  },
  toOrd: ({ units, ...rest }: ReactionValuePrecisionUnit<T>): Optional<OrdValuePrecisionUnit> => {
    const unitsOrd = typeToOrd(units);
    const isDefault = unitsOrd === 0 && Object.values(rest).every(value => value === null);
    return isDefault ? null : { units: unitsOrd, ...rest };
  },
});

const generateTypeDetailsConverter = <T extends string>(
  typeFromOrd: (value: OrdOptional<number>) => T,
  typeToOrd: (value: T) => OrdOptional<number>,
) => ({
  fromOrd: (ordValue: OrdOptional<OrdTypeDetails>): ReactionTypeDetails<T> => {
    const { details, type } = ordValue ?? {};
    return {
      type: typeFromOrd(type),
      details: details ?? null,
    };
  },
  toOrd: ({ type, details }: ReactionTypeDetails<T>): Optional<OrdTypeDetails> => {
    const typeOrd = typeToOrd(type);
    const isDefault = typeOrd === 0 && (details === null || details === '');
    return isDefault ? null : { type: typeOrd, details: details };
  },
});

export const { fromOrd: ordTimeToReaction, toOrd: reactionTimeToOrd } = generateValuePrecisionUnitConverter(
  ordTimeTypeToReaction,
  reactionTimeTypeToOrd,
);

export const { fromOrd: ordAdditionDeviceToReaction, toOrd: reactionAdditionDeviceToOrd } =
  generateTypeDetailsConverter(ordAdditionDeviceTypeToReaction, reactionAdditionDeviceTypeToOrd);

export const { fromOrd: ordAdditionSpeedToReaction, toOrd: reactionAdditionSpeedToOrd } = generateTypeDetailsConverter(
  ordAdditionSpeedTypeToReaction,
  reactionAdditionSpeedTypeToOrd,
);

export const { fromOrd: ordFlowRateToReaction, toOrd: reactionFlowRateToOrd } = generateValuePrecisionUnitConverter(
  ordFlowRateTypeToReaction,
  reactionFlowRateTypeToOrd,
);

export const { fromOrd: ordTemperatureToReaction, toOrd: reactionTemperatureToOrd } =
  generateValuePrecisionUnitConverter(ordTemperatureTypeToReaction, reactionTemperatureTypeToOrd);

export const { fromOrd: ordTextureToReaction, toOrd: reactionTextureToOrd } = generateTypeDetailsConverter(
  ordTextureTypeToReaction,
  reactionTextureTypeToOrd,
);

export const { fromOrd: ordSelectivityToReaction, toOrd: reactionSelectivityToOrd } = generateTypeDetailsConverter(
  ordSelectivityTypeToReaction,
  reactionSelectivityTypeToOrd,
);

export const { fromOrd: ordWaveLengthToReaction, toOrd: reactionWaveLengthToOrd } = generateValuePrecisionUnitConverter(
  ordWaveLengthTypeToReaction,
  reactionWaveLengthTypeToOrd,
);

export const ordReactionIdentifierToReaction = ({
  type,
  details,
  value,
}: ord.IReactionIdentifier): ReactionIdentifier =>
  withId({
    type: ordReactionIdentifierTypeToReaction(type),
    value: value ?? null,
    details: details ?? null,
  });

export const reactionIdentifierToOrd = ({ type, ...rest }: ReactionIdentifier) =>
  withoutId({
    type: reactionIdentifierTypeToOrd(type),
    ...rest,
  });

export const ordMassSpecToReaction = (
  massSpec: OrdOptional<ord.ProductMeasurement.IMassSpecMeasurementDetails>,
): ReactionMassSpec => {
  const { type, eicMasses, ...rest } = massSpec ?? {};
  return {
    type: ordMassSpecTypeToReaction(type),
    eicMasses: eicMasses ?? [],
    ...rest,
  };
};

export const reactionMassSpecToOrd = ({
  type,
  eicMasses,
  ...rest
}: ReactionMassSpec): ord.ProductMeasurement.IMassSpecMeasurementDetails => ({
  type: reactionMassSpecTypeToOrd(type),
  eicMasses: eicMasses?.length > 0 ? eicMasses : null,
  ...rest,
});

export const ordCompoundIdentifierToReaction = ({
  type,
  ...rest
}: ord.ICompoundIdentifier): ReactionCompoundIdentifier =>
  withId({
    type: ordCompoundIdentifierTypeToReaction(type),
    ...rest,
  });

export const reactionCompoundIdentifierToOrd = ({
  type,
  ...rest
}: ReactionCompoundIdentifier): ord.ICompoundIdentifier => ({
  type: reactionCompoundIdentifierTypeToOrd(type),
  ...rest,
});
