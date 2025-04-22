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
import {
  ordBooleanToReaction,
  ordCompoundIdentifierToReaction,
  ordMassSpecToReaction,
  ordSelectivityToReaction,
  ordTextureToReaction,
  ordTimeToReaction,
  ordWaveLengthToReaction,
  reactionBooleanToOrd,
  reactionCompoundIdentifierToOrd,
  reactionMassSpecToOrd,
  reactionSelectivityToOrd,
  reactionTextureToOrd,
  reactionTimeToOrd,
  reactionWaveLengthToOrd,
  withId,
} from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';
import {
  ordMeasurementTypeToReaction,
  ordPreparationTypeToReaction,
  ordReactionRoleToReaction,
  reactionMeasurementTypeToOrd,
  reactionPreparationTypeToOrd,
  reactionReactionRoleToOrd,
} from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.converters.ts';
import {
  ordDataMapToReactionDataMap,
  reactionDataMapToOrdDataMap,
} from 'store/entities/reactions/reactionData/reactionData.converters.ts';
import {
  ordAmountToReaction,
  reactionAmountToOrd,
} from 'store/entities/reactions/reactionAmount/reactionAmount.converters.ts';
import {
  type OrdComponentBase,
  type ReactionComponentBase,
  type ReactionComponentPreparation,
  type ReactionInputComponent,
  type ReactionMeasurement,
  type ReactionMeasurementValue,
  ReactionMeasurementValueType,
  type ReactionProduct,
} from './reactionComponent.types.ts';
import type {
  Optional,
  OrdOptional,
  ReactionCompoundIdentifier,
} from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import { measurementTransform } from '../reactionsMeasurement/reactionMeasurements.transform.ts';

const emptyIdentifiersArray: Array<ReactionCompoundIdentifier> = [];

const ordCompoundSourceToReaction = (compoundSource: OrdOptional<ord.Compound.ISource>): ord.Compound.ISource => {
  const { vendor, lot, catalogId } = compoundSource ?? {};
  return {
    vendor: vendor ?? null,
    catalogId: catalogId ?? null,
    lot: lot ?? null,
  };
};

const reactionCompoundSourceToOrd = (compoundSource: ord.Compound.ISource): Optional<ord.Compound.ISource> => {
  const { vendor, lot, catalogId } = compoundSource;
  const hasAnyValues = !!vendor || !!lot || !!catalogId;
  return hasAnyValues ? compoundSource : null;
};

export const ordPreparationToReaction = ({ type, ...rest }: ord.ICompoundPreparation): ReactionComponentPreparation => {
  return withId({
    type: ordPreparationTypeToReaction(type),
    ...rest,
  });
};

export const reactionPreparationToOrd = ({
  type,
  details,
  reactionId,
}: ReactionComponentPreparation): ord.ICompoundPreparation => {
  return {
    type: reactionPreparationTypeToOrd(type),
    details,
    reactionId: type === 'SYNTHESIZED' ? reactionId : null,
  };
};

const ordMeasurementValueToReaction = (measurement: ord.IProductMeasurement): Optional<ReactionMeasurementValue> => {
  if (measurement.amount) {
    return {
      type: ReactionMeasurementValueType.Mass,
      value: ordAmountToReaction(measurement.amount),
    };
  }
  if (measurement.stringValue) {
    return {
      type: ReactionMeasurementValueType.String,
      value: measurement.stringValue,
    };
  }
  if (measurement.floatValue) {
    return {
      type: ReactionMeasurementValueType.Number,
      value: measurement.floatValue,
    };
  }
  if (measurement.percentage) {
    return {
      type: ReactionMeasurementValueType.Percent,
      value: measurement.percentage,
    };
  }
  return null;
};

const reactionMeasurementValueToOrd = ({ type, value }: ReactionMeasurementValue): Partial<ord.IProductMeasurement> => {
  switch (type) {
    case ReactionMeasurementValueType.Mass:
      return {
        amount: reactionAmountToOrd(value),
      };
    case ReactionMeasurementValueType.String:
      return {
        stringValue: value,
      };
    case ReactionMeasurementValueType.Number:
      return {
        floatValue: value,
      };
    default:
      return {
        percentage: value,
      };
  }
};

export const ordMeasurementToReaction = (measurement: ord.IProductMeasurement): ReactionMeasurement => {
  const {
    type,
    details,
    analysisKey,
    isNormalized,
    usesInternalStandard,
    usesAuthenticStandard,
    retentionTime,
    selectivity,
    wavelength,
    massSpecDetails,
    authenticStandard,
  } = measurement;
  return withId({
    type: ordMeasurementTypeToReaction(type),
    details,
    value: ordMeasurementValueToReaction(measurement),
    analysis: analysisKey ? { name: analysisKey, id: null } : null,
    isNormalized: ordBooleanToReaction(isNormalized),
    usesInternalStandard: ordBooleanToReaction(usesInternalStandard),
    usesAuthenticStandard: ordBooleanToReaction(usesAuthenticStandard),
    retentionTime: ordTimeToReaction(retentionTime),
    selectivity: ordSelectivityToReaction(selectivity),
    waveLength: ordWaveLengthToReaction(wavelength),
    massSpecDetails: ordMassSpecToReaction(massSpecDetails),
    authenticStandard: authenticStandard ? ordInputComponentToReaction(authenticStandard) : null,
  });
};

export const reactionMeasurementToOrd = (measurement: ReactionMeasurement): ord.IProductMeasurement => {
  const {
    type,
    details,
    value,
    analysis,
    isNormalized,
    usesInternalStandard,
    usesAuthenticStandard,
    retentionTime,
    selectivity,
    waveLength,
    massSpecDetails,
    authenticStandard,
  } = measurementTransform(measurement);

  return {
    type: reactionMeasurementTypeToOrd(type),
    details,
    analysisKey: analysis?.name,
    isNormalized: reactionBooleanToOrd(isNormalized),
    usesInternalStandard: reactionBooleanToOrd(usesInternalStandard),
    usesAuthenticStandard: reactionBooleanToOrd(usesAuthenticStandard),
    retentionTime: retentionTime ? reactionTimeToOrd(retentionTime) : null,
    selectivity: selectivity ? reactionSelectivityToOrd(selectivity) : null,
    wavelength: waveLength ? reactionWaveLengthToOrd(waveLength) : null,
    massSpecDetails: massSpecDetails ? reactionMassSpecToOrd(massSpecDetails) : null,
    authenticStandard: authenticStandard ? reactionInputComponentToOrd(authenticStandard) : null,
    ...(value ? reactionMeasurementValueToOrd(value) : {}),
  };
};

function ordComponentBaseToReaction({
  reactionRole,
  texture,
  identifiers,
  features,
}: OrdComponentBase): ReactionComponentBase {
  const reactionIdentifiers = (identifiers ?? []).map(ordCompoundIdentifierToReaction);

  const { nonMolBlockIdentifiers, molBlockIdentifiers } = reactionIdentifiers.reduce(
    ({ nonMolBlockIdentifiers, molBlockIdentifiers }, item) => {
      const isMolblock = item.type === 'MOLBLOCK';

      return {
        nonMolBlockIdentifiers: isMolblock ? nonMolBlockIdentifiers : nonMolBlockIdentifiers.concat(item),
        molBlockIdentifiers: isMolblock ? molBlockIdentifiers.concat(item) : molBlockIdentifiers,
      };
    },
    { nonMolBlockIdentifiers: emptyIdentifiersArray, molBlockIdentifiers: emptyIdentifiersArray },
  );
  return withId({
    reactionRole: ordReactionRoleToReaction(reactionRole),
    texture: ordTextureToReaction(texture),
    identifiers: nonMolBlockIdentifiers,
    molBlockIdentifiers: molBlockIdentifiers,
    features: ordDataMapToReactionDataMap(features ?? {}),
  });
}

function reactionComponentBaseToOrd({
  identifiers,
  molBlockIdentifiers,
  reactionRole,
  texture,
  features,
}: ReactionComponentBase): OrdComponentBase {
  const ordIdentifiers = [...molBlockIdentifiers, ...identifiers].map(reactionCompoundIdentifierToOrd);
  return {
    reactionRole: reactionReactionRoleToOrd(reactionRole),
    texture: reactionTextureToOrd(texture),
    identifiers: ordIdentifiers,
    features: reactionDataMapToOrdDataMap(features),
  };
}

export function ordInputComponentToReaction(inputComponent: ord.ICompound): ReactionInputComponent {
  const { amount, preparations, isLimiting, source } = inputComponent;

  return {
    ...ordComponentBaseToReaction(inputComponent),
    isLimiting: ordBooleanToReaction(isLimiting),
    source: ordCompoundSourceToReaction(source),
    preparations: (preparations ?? []).map(ordPreparationToReaction),
    amount: ordAmountToReaction(amount),
  };
}

export function reactionInputComponentToOrd(inputComponent: ReactionInputComponent): ord.ICompound {
  const { amount, preparations, source } = inputComponent;
  const isLimiting =
    inputComponent.reactionRole === 'REACTANT' ? reactionBooleanToOrd(inputComponent.isLimiting) : null;
  return {
    ...reactionComponentBaseToOrd(inputComponent),
    isLimiting,
    source: reactionCompoundSourceToOrd(source),
    preparations: preparations.map(reactionPreparationToOrd),
    amount: reactionAmountToOrd(amount),
  };
}

export function ordProductToReaction(product: ord.IProductCompound): ReactionProduct {
  const { measurements, isDesiredProduct, isolatedColor } = product;
  return {
    ...ordComponentBaseToReaction(product),
    isDesiredProduct: ordBooleanToReaction(isDesiredProduct),
    isolatedColor,
    measurements: (measurements ?? []).map(ordMeasurementToReaction),
  };
}

export function reactionProductToOrd(product: ReactionProduct): ord.IProductCompound {
  const { measurements, isDesiredProduct, isolatedColor } = product;
  return {
    ...reactionComponentBaseToOrd(product),
    isDesiredProduct: reactionBooleanToOrd(isDesiredProduct),
    isolatedColor,
    measurements: measurements.map(reactionMeasurementToOrd),
  };
}
