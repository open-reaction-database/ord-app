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
  type ReactionDateTime,
  type Tubing,
  type StirringRate,
  type OrdValuePrecision,
  type ReactionValuePrecision,
  ReactionBoolean,
} from './reactionEntity.types';
import {
  ordAdditionDeviceTypeToReaction,
  ordAdditionSpeedTypeToReaction,
  ordCompoundIdentifierTypeToReaction,
  ordElectrochemistryTypeToReaction,
  ordFlowRateTypeToReaction,
  ordMassSpecTypeToReaction,
  ordPressureTypeToReaction,
  ordReactionIdentifierTypeToReaction,
  ordSelectivityTypeToReaction,
  ordTemperatureTypeToReaction,
  ordTextureTypeToReaction,
  ordTimeTypeToReaction,
  ordWaveLengthTypeToReaction,
  ordLengthTypeToReaction,
  ordCurrentTypeToReaction,
  reactionAdditionDeviceTypeToOrd,
  reactionAdditionSpeedTypeToOrd,
  reactionCompoundIdentifierTypeToOrd,
  reactionFlowRateTypeToOrd,
  reactionIdentifierTypeToOrd,
  reactionMassSpecTypeToOrd,
  reactionPressureTypeToOrd,
  reactionSelectivityTypeToOrd,
  reactionTemperatureTypeToOrd,
  reactionTextureTypeToOrd,
  reactionTimeTypeToOrd,
  reactionWaveLengthTypeToOrd,
  reactionLengthTypeToOrd,
  reactionCurrentTypeToOrd,
  ordTemperatureControlTypeToReaction,
  reactionTemperatureControlTypeToOrd,
  ordPressureControlTypeToReaction,
  reactionPressureControlTypeToOrd,
  ordAtmosphereTypeToReaction,
  reactionAtmosphereTypeToOrd,
  ordStirringRateTypeToReaction,
  reactionStirringRateTypeToOrd,
  ordVoltageUnitToReaction,
  reactionVoltageUnitToOrd,
  ordElectrochemistryCellTypeToReaction,
  reactionElectrochemistryCellTypeToOrd,
  ordTubingTypeToReaction,
  reactionTubingTypeToOrd,
  ordVolumeTypeToReaction,
  reactionVolumeTypeToOrd,
  reactionVesselMaterialTypeToOrd,
  ordVesselMaterialTypeToReaction,
  ordEnvironmentTypeToReaction,
  reactionEnvironmentTypeToOrd,
} from '../reactionEntityTypes/reactionEntityTypes.converters';
import type { MessageInitShape } from '@bufbuild/protobuf';
import type {
  CompoundIdentifier,
  CompoundIdentifierSchema,
  DateTime,
  DateTimeSchema,
  ElectrochemistryConditions_ElectrochemistryType,
  FlowConditions_Tubing,
  FlowConditions_TubingSchema,
  ProductMeasurement_MassSpecMeasurementDetails,
  ProductMeasurement_MassSpecMeasurementDetailsSchema,
  ReactionIdentifier as OrdReactionIdentifier,
  ReactionIdentifierSchema,
  StirringConditions_StirringRate,
  StirringConditions_StirringRateSchema,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import type { ElectrochemistryType } from '../reactionEntityTypes/reactionEntityTypes.types';
import { convertUtcDateToUserTZ, convertUserTZDateToUtc } from 'common/utils';
import { DATE_TIME_FORMAT } from 'common/constants.ts';

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

export function withoutIdName<T extends ReactionNamedEntity>(
  entity: T,
): WithoutIdName<T> {
  const { id: _i, name: _n, ...rest } = entity;
  return rest;
}

export function ordBooleanToReaction(value?: boolean | null): ReactionBoolean {
  if (value === undefined || value === null) {
    return ReactionBoolean.Unspecified;
  }
  return value ? ReactionBoolean.True : ReactionBoolean.False;
}

export function reactionBooleanToOrd(value: ReactionBoolean): boolean | undefined {
  switch (value) {
    case ReactionBoolean.Unspecified:
      return undefined;
    case ReactionBoolean.True:
      return true;
    case ReactionBoolean.False:
      return false;
  }
}

// Proto3 reads an unset string or number field as '' or 0. The store holds such a field as
// undefined, so forms show it as empty and lists sort and render it as unset.
export function ordScalarToReaction<T extends string | number>(
  value: OrdOptional<T>,
): T | undefined {
  return value || undefined;
}

// Encoding an int32 field that holds a decimal throws. The form inputs for these fields
// reject decimals, but a template variable can still supply one, so it is truncated toward
// zero.
export function reactionIntegerToOrd(value: OrdOptional<number>): number | undefined {
  return value === null || value === undefined ? undefined : Math.trunc(value);
}

export function ordValuePrecisionToReaction(
  ordValue: OrdOptional<OrdValuePrecision>,
): ReactionValuePrecision {
  const { value, precision } = ordValue ?? {};
  return {
    value: value ?? null,
    precision: precision ?? null,
  };
}

export function reactionValuePrecisionToOrd({
  value,
  precision,
}: ReactionValuePrecision): OrdValuePrecision | undefined {
  if (value === null && precision === null) {
    return undefined;
  }
  return { value: value ?? undefined, precision: precision ?? undefined };
}

const generateValuePrecisionUnitConverter = <T extends string>(
  typeFromOrd: (value: OrdOptional<number>) => T,
  typeToOrd: (value: T) => number,
) => ({
  fromOrd: (
    ordValue: OrdOptional<OrdValuePrecisionUnit>,
  ): ReactionValuePrecisionUnit<T> => {
    const { value, precision, units } = ordValue ?? {};
    return {
      value: value ?? null,
      precision: precision ?? null,
      units: typeFromOrd(units),
    };
  },
  toOrd: (
    vpu: Optional<ReactionValuePrecisionUnit<T>>,
  ): OrdValuePrecisionUnit | undefined => {
    if (!vpu) {
      return undefined;
    }
    const { units, value, precision } = vpu;

    const unitsOrd = typeToOrd(units);
    const isDefault = unitsOrd === 0 && value === null && precision === null;
    return isDefault
      ? undefined
      : {
          units: unitsOrd,
          value: value ?? undefined,
          precision: precision ?? undefined,
        };
  },
});

const generateTypeDetailsConverter = <T extends string>(
  typeFromOrd: (value: OrdOptional<number>) => T,
  typeToOrd: (value: T) => number,
) => ({
  fromOrd: (ordValue: OrdOptional<OrdTypeDetails>): ReactionTypeDetails<T> => {
    const { details, type } = ordValue ?? {};
    return {
      type: typeFromOrd(type),
      details: details || null,
    };
  },
  toOrd: (
    typeDetails: Optional<ReactionTypeDetails<T>>,
  ): OrdTypeDetails | undefined => {
    if (!typeDetails) {
      return undefined;
    }
    const { type, details } = typeDetails;
    const typeOrd = typeToOrd(type);
    const isDefault = typeOrd === 0 && (details === null || details === '');
    return isDefault ? undefined : { type: typeOrd, details: details ?? undefined };
  },
});

export const { fromOrd: ordTimeToReaction, toOrd: reactionTimeToOrd } =
  generateValuePrecisionUnitConverter(ordTimeTypeToReaction, reactionTimeTypeToOrd);

export const {
  fromOrd: ordAdditionDeviceToReaction,
  toOrd: reactionAdditionDeviceToOrd,
} = generateTypeDetailsConverter(
  ordAdditionDeviceTypeToReaction,
  reactionAdditionDeviceTypeToOrd,
);

export const {
  fromOrd: ordAdditionSpeedToReaction,
  toOrd: reactionAdditionSpeedToOrd,
} = generateTypeDetailsConverter(
  ordAdditionSpeedTypeToReaction,
  reactionAdditionSpeedTypeToOrd,
);

export const { fromOrd: ordFlowRateToReaction, toOrd: reactionFlowRateToOrd } =
  generateValuePrecisionUnitConverter(
    ordFlowRateTypeToReaction,
    reactionFlowRateTypeToOrd,
  );

export const { fromOrd: ordTemperatureToReaction, toOrd: reactionTemperatureToOrd } =
  generateValuePrecisionUnitConverter(
    ordTemperatureTypeToReaction,
    reactionTemperatureTypeToOrd,
  );

export const { fromOrd: ordPressureToReaction, toOrd: reactionPressureToOrd } =
  generateValuePrecisionUnitConverter(
    ordPressureTypeToReaction,
    reactionPressureTypeToOrd,
  );

export const { fromOrd: ordTextureToReaction, toOrd: reactionTextureToOrd } =
  generateTypeDetailsConverter(ordTextureTypeToReaction, reactionTextureTypeToOrd);

export const { fromOrd: ordSelectivityToReaction, toOrd: reactionSelectivityToOrd } =
  generateTypeDetailsConverter(
    ordSelectivityTypeToReaction,
    reactionSelectivityTypeToOrd,
  );

export const { fromOrd: ordWaveLengthToReaction, toOrd: reactionWaveLengthToOrd } =
  generateValuePrecisionUnitConverter(
    ordWaveLengthTypeToReaction,
    reactionWaveLengthTypeToOrd,
  );

export const { fromOrd: ordLengthToReaction, toOrd: reactionLengthToOrd } =
  generateValuePrecisionUnitConverter(ordLengthTypeToReaction, reactionLengthTypeToOrd);

export const { fromOrd: ordCurrentToReaction, toOrd: reactionCurrentToOrd } =
  generateValuePrecisionUnitConverter(
    ordCurrentTypeToReaction,
    reactionCurrentTypeToOrd,
  );

export const {
  fromOrd: ordTemperatureControlToReaction,
  toOrd: reactionTemperatureControlToOrd,
} = generateTypeDetailsConverter(
  ordTemperatureControlTypeToReaction,
  reactionTemperatureControlTypeToOrd,
);

export const {
  fromOrd: ordPressureControlToReaction,
  toOrd: reactionPressureControlToOrd,
} = generateTypeDetailsConverter(
  ordPressureControlTypeToReaction,
  reactionPressureControlTypeToOrd,
);

export const { fromOrd: ordAtmosphereToReaction, toOrd: reactionAtmosphereToOrd } =
  generateTypeDetailsConverter(
    ordAtmosphereTypeToReaction,
    reactionAtmosphereTypeToOrd,
  );

export const { fromOrd: ordVoltageToReaction, toOrd: reactionVoltageToOrd } =
  generateValuePrecisionUnitConverter(
    ordVoltageUnitToReaction,
    reactionVoltageUnitToOrd,
  );

export const {
  fromOrd: ordElectrochemistryCellToReaction,
  toOrd: reactionElectrochemistryCellToOrd,
} = generateTypeDetailsConverter(
  ordElectrochemistryCellTypeToReaction,
  reactionElectrochemistryCellTypeToOrd,
);

export const ordReactionIdentifierToReaction = ({
  type,
  details,
  value,
}: OrdReactionIdentifier): ReactionIdentifier =>
  withId({
    type: ordReactionIdentifierTypeToReaction(type),
    value: value || null,
    details: details || null,
  });

export const reactionIdentifierToOrd = ({
  type,
  value,
  details,
}: ReactionIdentifier): MessageInitShape<typeof ReactionIdentifierSchema> => ({
  type: reactionIdentifierTypeToOrd(type),
  value: value ?? undefined,
  details: details ?? undefined,
});

export const ordMassSpecToReaction = (
  massSpec: OrdOptional<ProductMeasurement_MassSpecMeasurementDetails>,
): ReactionMassSpec => ({
  type: ordMassSpecTypeToReaction(massSpec?.type),
  eicMasses: massSpec?.eicMasses ?? [],
  details: ordScalarToReaction(massSpec?.details),
  ticMinimumMz: massSpec?.ticMinimumMz,
  ticMaximumMz: massSpec?.ticMaximumMz,
});

export const reactionMassSpecToOrd = ({
  type,
  eicMasses,
  details,
  ticMinimumMz,
  ticMaximumMz,
}: ReactionMassSpec): MessageInitShape<
  typeof ProductMeasurement_MassSpecMeasurementDetailsSchema
> => ({
  type: reactionMassSpecTypeToOrd(type),
  eicMasses: eicMasses?.length > 0 ? eicMasses : undefined,
  details: details ?? undefined,
  ticMinimumMz: ticMinimumMz ?? undefined,
  ticMaximumMz: ticMaximumMz ?? undefined,
});

export const ordCompoundIdentifierToReaction = ({
  type,
  details,
  value,
}: CompoundIdentifier): ReactionCompoundIdentifier =>
  withId({
    type: ordCompoundIdentifierTypeToReaction(type),
    details: ordScalarToReaction(details),
    value: ordScalarToReaction(value),
  });

export const reactionCompoundIdentifierToOrd = ({
  type,
  details,
  value,
}: ReactionCompoundIdentifier): MessageInitShape<typeof CompoundIdentifierSchema> => ({
  type: reactionCompoundIdentifierTypeToOrd(type),
  details: details ?? undefined,
  value: value ?? undefined,
});

export const ordDateTimeToReaction = (
  dateTime: OrdOptional<DateTime>,
): ReactionDateTime => {
  if (!dateTime?.value) {
    return null;
  }
  const date = convertUtcDateToUserTZ(dateTime.value);
  return date.isValid() ? date.format(DATE_TIME_FORMAT) : dateTime.value;
};

export const reactionDateTimeToOrd = (
  dateTime: ReactionDateTime,
): MessageInitShape<typeof DateTimeSchema> | undefined => {
  if (!dateTime) {
    return undefined;
  }
  const date = convertUserTZDateToUtc(dateTime);
  return { value: date.isValid() ? date.format(DATE_TIME_FORMAT) : dateTime };
};

export const ordTubingToReaction = (
  tubing: OrdOptional<FlowConditions_Tubing>,
): Tubing => ({
  type: ordTubingTypeToReaction(tubing?.type),
  details: ordScalarToReaction(tubing?.details),
  diameter: ordLengthToReaction(tubing?.diameter),
});

export const reactionTubingToOrd = ({
  type,
  details,
  diameter,
}: Tubing): MessageInitShape<typeof FlowConditions_TubingSchema> | undefined => {
  const diameterOrd = reactionLengthToOrd(diameter);
  const typeOrd = reactionTubingTypeToOrd(type);

  return diameterOrd || typeOrd !== 0 || details
    ? {
        type: typeOrd,
        details: details ?? undefined,
        diameter: diameterOrd,
      }
    : undefined;
};

export const ordStirringRateToReaction = (
  stirringRate: OrdOptional<StirringConditions_StirringRate>,
): StirringRate => ({
  type: ordStirringRateTypeToReaction(stirringRate?.type),
  details: ordScalarToReaction(stirringRate?.details),
  rpm: ordScalarToReaction(stirringRate?.rpm),
});

export const reactionStirringRateToOrd = ({
  type,
  details,
  rpm,
}: StirringRate):
  | MessageInitShape<typeof StirringConditions_StirringRateSchema>
  | undefined => {
  const ordType = reactionStirringRateTypeToOrd(type);
  return ordType !== 0 || details || rpm
    ? {
        type: ordType,
        details: details ?? undefined,
        rpm: reactionIntegerToOrd(rpm),
      }
    : undefined;
};

export const convertElectrochemistryTypeToOrd = (
  type: OrdOptional<ElectrochemistryConditions_ElectrochemistryType>,
): ElectrochemistryType => {
  return type !== undefined && type !== null
    ? ordElectrochemistryTypeToReaction(type)
    : ordElectrochemistryTypeToReaction(0);
};

export const {
  fromOrd: ordVolumeConditionToReaction,
  toOrd: reactionVolumeConditionToOrd,
} = generateValuePrecisionUnitConverter(
  ordVolumeTypeToReaction,
  reactionVolumeTypeToOrd,
);

export const {
  fromOrd: ordVesselMaterialToReaction,
  toOrd: reactionVesselMaterialToOrd,
} = generateTypeDetailsConverter(
  ordVesselMaterialTypeToReaction,
  reactionVesselMaterialTypeToOrd,
);

export const { fromOrd: ordEnvironmentToReaction, toOrd: reactionEnvironmentToOrd } =
  generateTypeDetailsConverter(
    ordEnvironmentTypeToReaction,
    reactionEnvironmentTypeToOrd,
  );
