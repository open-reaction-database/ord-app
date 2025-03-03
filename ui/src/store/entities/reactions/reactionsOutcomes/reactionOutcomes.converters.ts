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
import type { AppReactionAnalysis, AppReactionOutcome, AppReactionProduct } from './reactionOutcomes.types.ts';
import type { ord } from 'ord-schema-protobufjs';
import {
  ordDataMapToReactionDataMap,
  reactionDataMapToOrdDataMap,
} from 'store/entities/reactions/reactionData/reactionData.converters.ts';
import {
  withId,
  withIdName,
  withoutId,
  withoutIdName,
} from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';
import {
  ordAnalysisTypeToReaction,
  ordReactionRoleToReaction,
  reactionAnalysisTypeToOrd,
  reactionReactionRoleToOrd,
} from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.converters.ts';
import {
  ordCompoundIdentifierToReactionCompoundIdentifier,
  reactionCompoundIdentifierToOrdCompoundIdentifier,
} from 'store/entities/reactions/reactionCompoundIdentifier/reactionCompoundIdentifiers.converters.ts';

export const ordAnalysisToReactionAnalysis = (
  { type, data, instrumentLastCalibrated, ...rest }: ord.IAnalysis,
  name: string,
): AppReactionAnalysis =>
  withIdName(
    {
      type: ordAnalysisTypeToReaction(type),
      data: ordDataMapToReactionDataMap(data || {}),
      instrumentLastCalibrated: instrumentLastCalibrated?.value ?? null,
      ...rest,
    },
    name,
  );

const reactionAnalysisToOrdAnalysis = ({
  type,
  data,
  instrumentLastCalibrated,
  ...rest
}: AppReactionAnalysis): ord.IAnalysis =>
  withoutIdName({
    type: reactionAnalysisTypeToOrd(type),
    data: reactionDataMapToOrdDataMap(data),
    instrumentLastCalibrated: instrumentLastCalibrated ? { value: instrumentLastCalibrated } : null,
    ...rest,
  });

const ordProductToReactionProduct = ({
  reactionRole,
  identifiers,
  ...rest
}: ord.IProductCompound): AppReactionProduct => {
  return withId({
    reactionRole: ordReactionRoleToReaction(reactionRole),
    identifiers: (identifiers || []).map(ordCompoundIdentifierToReactionCompoundIdentifier),
    ...rest,
  });
};

const reactionProductToOrdProduct = ({
  reactionRole,
  identifiers,
  ...rest
}: AppReactionProduct): ord.IProductCompound => {
  return withoutId({
    reactionRole: reactionReactionRoleToOrd(reactionRole),
    identifiers: identifiers.map(reactionCompoundIdentifierToOrdCompoundIdentifier),
    ...rest,
  });
};

export const ordOutcomeToReactionOutcome = ({
  analyses,
  products,
  ...rest
}: ord.IReactionOutcome): AppReactionOutcome =>
  withId({
    analyses: Object.entries(analyses || {}).reduce((acc, [name, value]) => {
      const analysis = ordAnalysisToReactionAnalysis(value, name);
      return {
        ...acc,
        [analysis.id]: analysis,
      };
    }, {}),
    products: (products || []).map(ordProductToReactionProduct),
    ...rest,
  });

export const reactionOutcomeToOrdOutcome = ({
  analyses,
  products,
  ...rest
}: AppReactionOutcome): ord.IReactionOutcome =>
  withoutId({
    analyses: Object.values(analyses || {}).reduce(
      (acc, value) => ({
        ...acc,
        [value.name]: reactionAnalysisToOrdAnalysis(value),
      }),
      {},
    ),
    products: products.map(reactionProductToOrdProduct),
    ...rest,
  });

export const ordOutcomesListToReactionOutcomesList = (
  outcomes: Array<ord.IReactionOutcome>,
): Array<AppReactionOutcome> => {
  return outcomes.map(ordOutcomeToReactionOutcome);
};

export const reactionOutcomesListToOrdOutcomesList = (
  outcomes: Array<AppReactionOutcome>,
): Array<ord.IReactionOutcome> => {
  return outcomes.map(reactionOutcomeToOrdOutcome);
};
