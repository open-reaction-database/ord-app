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
  ordCompoundIdentifierToReaction,
  reactionCompoundIdentifierToOrd,
} from 'store/entities/reactions/reactionCompoundIdentifier/reactionCompoundIdentifiers.converters.ts';
import {
  ordTextureToReaction,
  reactionTextureToOrd,
  withId,
  withoutId,
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
  ordAmountToReactionAmount,
  reactionAmountToOrdAmount,
} from 'store/entities/reactions/reactionAmount/reactionAmount.converters.ts';
import type {
  OrdComponentBase,
  ReactionComponentBase,
  ReactionComponentPreparation,
  ReactionInputComponent,
  ReactionMeasurement,
  ReactionProduct,
} from './reactionComponent.types.ts';
import type { ReactionCompoundIdentifier } from '../reactionCompoundIdentifier/reactionCompoundIdentifiers.types.ts';

const emptyIdentifiersArray: Array<ReactionCompoundIdentifier> = [];

const ordPreparationToReactionPreparation = ({
  type,
  ...rest
}: ord.ICompoundPreparation): ReactionComponentPreparation => {
  return withId({
    type: ordPreparationTypeToReaction(type),
    ...rest,
  });
};

const reactionPreparationToOrdPreparation = ({
  type,
  ...rest
}: ReactionComponentPreparation): ord.ICompoundPreparation => {
  return withoutId({
    type: reactionPreparationTypeToOrd(type),
    ...rest,
  });
};

const ordMeasurementToReaction = ({ type, ...rest }: ord.IProductMeasurement): ReactionMeasurement =>
  withId({
    type: ordMeasurementTypeToReaction(type),
    ...rest,
  });

const reactionMeasurementToOrd = ({ type, ...rest }: ReactionMeasurement): ord.IProductMeasurement =>
  withoutId({
    type: reactionMeasurementTypeToOrd(type),
    ...rest,
  });

function ordComponentBaseToReaction({
  reactionRole,
  texture,
  identifiers,
  features,
}: OrdComponentBase): ReactionComponentBase {
  const reactionIdentifiers = (identifiers || []).map(ordCompoundIdentifierToReaction);

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
    features: ordDataMapToReactionDataMap(features || {}),
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
    isLimiting,
    source,
    preparations: (preparations || []).map(ordPreparationToReactionPreparation),
    amount: ordAmountToReactionAmount(amount),
  };
}

export function reactionInputComponentToOrd(inputComponent: ReactionInputComponent): ord.ICompound {
  const { amount, preparations, isLimiting, source } = inputComponent;
  return {
    ...reactionComponentBaseToOrd(inputComponent),
    isLimiting,
    source,
    preparations: preparations.map(reactionPreparationToOrdPreparation),
    amount: reactionAmountToOrdAmount(amount),
  };
}

export function ordProductToReaction(product: ord.IProductCompound): ReactionProduct {
  const { measurements, isDesiredProduct, isolatedColor } = product;
  return {
    ...ordComponentBaseToReaction(product),
    isDesiredProduct,
    isolatedColor,
    measurements: (measurements || []).map(ordMeasurementToReaction),
  };
}

export function reactionProductToOrd(product: ReactionProduct): ord.IProductCompound {
  const { measurements, isDesiredProduct, isolatedColor } = product;
  return {
    ...reactionComponentBaseToOrd(product),
    isDesiredProduct,
    isolatedColor,
    measurements: measurements.map(reactionMeasurementToOrd),
  };
}
