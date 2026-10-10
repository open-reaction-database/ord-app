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
import type { MessageInitShape } from '@bufbuild/protobuf';
import type {
  Compound,
  Compound_Source,
  Compound_SourceSchema,
  CompoundPreparation,
  CompoundPreparationSchema,
  CompoundSchema,
  ProductCompound,
  ProductCompoundSchema,
  ProductMeasurement,
  ProductMeasurementSchema,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import {
  ordBooleanToReaction,
  ordCompoundIdentifierToReaction,
  ordMassSpecToReaction,
  ordScalarToReaction,
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
  type ReactionComponentBase,
  type ReactionComponentPreparation,
  type ReactionCompoundSource,
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

type OrdComponentBaseField = 'identifiers' | 'reactionRole' | 'texture' | 'features';

type OrdComponentBase = Pick<Compound, OrdComponentBaseField> &
  Pick<ProductCompound, OrdComponentBaseField>;

const emptyIdentifiersArray: Array<ReactionCompoundIdentifier> = [];

const ordCompoundSourceToReaction = (
  compoundSource: OrdOptional<Compound_Source>,
): ReactionCompoundSource => ({
  vendor: compoundSource?.vendor || null,
  catalogId: compoundSource?.catalogId || null,
  lot: compoundSource?.lot || null,
});

const reactionCompoundSourceToOrd = ({
  vendor,
  lot,
  catalogId,
}: ReactionCompoundSource):
  | MessageInitShape<typeof Compound_SourceSchema>
  | undefined => {
  const hasAnyValues = !!vendor || !!lot || !!catalogId;
  return hasAnyValues
    ? {
        vendor: vendor ?? undefined,
        catalogId: catalogId ?? undefined,
        lot: lot ?? undefined,
      }
    : undefined;
};

export const ordPreparationToReaction = ({
  type,
  details,
  reactionId,
}: CompoundPreparation): ReactionComponentPreparation => {
  return withId({
    type: ordPreparationTypeToReaction(type),
    details: ordScalarToReaction(details),
    reactionId: ordScalarToReaction(reactionId),
  });
};

export const reactionPreparationToOrd = ({
  type,
  details,
  reactionId,
}: ReactionComponentPreparation): MessageInitShape<
  typeof CompoundPreparationSchema
> => {
  return {
    type: reactionPreparationTypeToOrd(type),
    details: details ?? undefined,
    reactionId: type === 'SYNTHESIZED' ? (reactionId ?? undefined) : undefined,
  };
};

const ordMeasurementValueToReaction = ({
  value,
}: ProductMeasurement): Optional<ReactionMeasurementValue> => {
  switch (value.case) {
    case 'amount':
      return {
        type: ReactionMeasurementValueType.Mass,
        value: ordAmountToReaction(value.value),
      };
    case 'stringValue':
      return value.value
        ? { type: ReactionMeasurementValueType.String, value: value.value }
        : null;
    case 'floatValue':
      return {
        type: ReactionMeasurementValueType.Number,
        value: { value: value.value.value, precision: value.value.precision },
      };
    case 'percentage':
      return {
        type: ReactionMeasurementValueType.Percent,
        value: { value: value.value.value, precision: value.value.precision },
      };
    default:
      return null;
  }
};

const reactionMeasurementValueToOrd = ({
  type,
  value,
}: ReactionMeasurementValue): MessageInitShape<
  typeof ProductMeasurementSchema
>['value'] => {
  switch (type) {
    case ReactionMeasurementValueType.Mass: {
      const amount = reactionAmountToOrd(value);
      return amount ? { case: 'amount', value: amount } : undefined;
    }
    case ReactionMeasurementValueType.String:
      return { case: 'stringValue', value };
    case ReactionMeasurementValueType.Number:
      return {
        case: 'floatValue',
        value: {
          value: value.value ?? undefined,
          precision: value.precision ?? undefined,
        },
      };
    default:
      return {
        case: 'percentage',
        value: {
          value: value.value ?? undefined,
          precision: value.precision ?? undefined,
        },
      };
  }
};

export const ordMeasurementToReaction = (
  measurement: ProductMeasurement,
): ReactionMeasurement => {
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
    details: ordScalarToReaction(details),
    value: ordMeasurementValueToReaction(measurement),
    analysis: analysisKey ? { name: analysisKey, id: null } : null,
    isNormalized: ordBooleanToReaction(isNormalized),
    usesInternalStandard: ordBooleanToReaction(usesInternalStandard),
    usesAuthenticStandard: ordBooleanToReaction(usesAuthenticStandard),
    retentionTime: ordTimeToReaction(retentionTime),
    selectivity: ordSelectivityToReaction(selectivity),
    waveLength: ordWaveLengthToReaction(wavelength),
    massSpecDetails: ordMassSpecToReaction(massSpecDetails),
    authenticStandard: authenticStandard
      ? ordInputComponentToReaction(authenticStandard)
      : null,
  });
};

export const reactionMeasurementToOrd = (
  measurement: ReactionMeasurement,
): MessageInitShape<typeof ProductMeasurementSchema> => {
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
    details: details ?? undefined,
    analysisKey: analysis?.name,
    isNormalized: reactionBooleanToOrd(isNormalized),
    usesInternalStandard: reactionBooleanToOrd(usesInternalStandard),
    usesAuthenticStandard: reactionBooleanToOrd(usesAuthenticStandard),
    retentionTime: retentionTime ? reactionTimeToOrd(retentionTime) : undefined,
    selectivity: selectivity ? reactionSelectivityToOrd(selectivity) : undefined,
    wavelength: waveLength ? reactionWaveLengthToOrd(waveLength) : undefined,
    massSpecDetails: massSpecDetails
      ? reactionMassSpecToOrd(massSpecDetails)
      : undefined,
    authenticStandard: authenticStandard
      ? reactionInputComponentToOrd(authenticStandard)
      : undefined,
    value: value ? reactionMeasurementValueToOrd(value) : undefined,
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
        nonMolBlockIdentifiers: isMolblock
          ? nonMolBlockIdentifiers
          : nonMolBlockIdentifiers.concat(item),
        molBlockIdentifiers: isMolblock
          ? molBlockIdentifiers.concat(item)
          : molBlockIdentifiers,
      };
    },
    {
      nonMolBlockIdentifiers: emptyIdentifiersArray,
      molBlockIdentifiers: emptyIdentifiersArray,
    },
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
}: ReactionComponentBase) {
  const ordIdentifiers = [...molBlockIdentifiers, ...identifiers].map(
    reactionCompoundIdentifierToOrd,
  );
  return {
    reactionRole: reactionReactionRoleToOrd(reactionRole),
    texture: reactionTextureToOrd(texture),
    identifiers: ordIdentifiers,
    features: reactionDataMapToOrdDataMap(features),
  };
}

export function ordInputComponentToReaction(
  inputComponent: Compound,
): ReactionInputComponent {
  const { amount, preparations, isLimiting, source } = inputComponent;

  return {
    ...ordComponentBaseToReaction(inputComponent),
    isLimiting: ordBooleanToReaction(isLimiting),
    source: ordCompoundSourceToReaction(source),
    preparations: (preparations ?? []).map(ordPreparationToReaction),
    amount: ordAmountToReaction(amount),
  };
}

export function reactionInputComponentToOrd(
  inputComponent: ReactionInputComponent,
): MessageInitShape<typeof CompoundSchema> {
  const { amount, preparations, source } = inputComponent;
  const isLimiting =
    inputComponent.reactionRole === 'REACTANT'
      ? reactionBooleanToOrd(inputComponent.isLimiting)
      : undefined;
  return {
    ...reactionComponentBaseToOrd(inputComponent),
    isLimiting,
    source: reactionCompoundSourceToOrd(source),
    preparations: preparations.map(reactionPreparationToOrd),
    amount: reactionAmountToOrd(amount),
  };
}

export function ordProductToReaction(product: ProductCompound): ReactionProduct {
  const { measurements, isDesiredProduct, isolatedColor } = product;
  return {
    ...ordComponentBaseToReaction(product),
    isDesiredProduct: ordBooleanToReaction(isDesiredProduct),
    isolatedColor: ordScalarToReaction(isolatedColor),
    measurements: (measurements ?? []).map(ordMeasurementToReaction),
  };
}

export function reactionProductToOrd(
  product: ReactionProduct,
): MessageInitShape<typeof ProductCompoundSchema> {
  const { measurements, isDesiredProduct, isolatedColor } = product;
  return {
    ...reactionComponentBaseToOrd(product),
    isDesiredProduct: reactionBooleanToOrd(isDesiredProduct),
    isolatedColor: isolatedColor ?? undefined,
    measurements: measurements.map(reactionMeasurementToOrd),
  };
}
