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
import type { ReactionAnalysis, ReactionOutcome } from './reactionOutcomes.types.ts';
import type { ord } from 'ord-schema-protobufjs';
import {
  ordDataMapToReactionDataMap,
  reactionDataMapToOrdDataMap,
} from 'store/entities/reactions/reactionData/reactionData.converters.ts';
import {
  ordBooleanToReaction,
  ordTimeToReaction,
  reactionBooleanToOrd,
  reactionTimeToOrd,
  withId,
  withIdName,
  withoutIdName,
} from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';
import {
  ordAnalysisTypeToReaction,
  reactionAnalysisTypeToOrd,
} from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.converters.ts';
import {
  ordProductToReaction,
  reactionProductToOrd,
} from 'store/entities/reactions/reactionComponent/reactionComponent.converters.ts';
import { itemsById } from 'common/utils';

export const ordAnalysisToReactionAnalysis = (
  { type, data, instrumentLastCalibrated, isOfIsolatedSpecies, ...rest }: ord.IAnalysis,
  name: string,
): ReactionAnalysis =>
  withIdName(
    {
      type: ordAnalysisTypeToReaction(type),
      data: ordDataMapToReactionDataMap(data || {}),
      instrumentLastCalibrated: instrumentLastCalibrated?.value ?? null,
      isOfIsolatedSpecies: ordBooleanToReaction(isOfIsolatedSpecies),
      ...rest,
    },
    name,
  );

const reactionAnalysisToOrdAnalysis = ({
  type,
  data,
  instrumentLastCalibrated,
  isOfIsolatedSpecies,
  ...rest
}: ReactionAnalysis): ord.IAnalysis =>
  withoutIdName({
    type: reactionAnalysisTypeToOrd(type),
    data: reactionDataMapToOrdDataMap(data),
    instrumentLastCalibrated: instrumentLastCalibrated ? { value: instrumentLastCalibrated } : null,
    isOfIsolatedSpecies: reactionBooleanToOrd(isOfIsolatedSpecies),
    ...rest,
  });

export const ordOutcomeToReactionOutcome = ({
  reactionTime,
  conversion,
  analyses,
  products,
}: ord.IReactionOutcome): ReactionOutcome =>
  withId({
    reactionTime: ordTimeToReaction(reactionTime),
    conversion,
    analyses: Object.entries(analyses || {}).reduce((acc, [name, value]) => {
      const analysis = ordAnalysisToReactionAnalysis(value, name);
      return {
        ...acc,
        [analysis.id]: analysis,
      };
    }, {}),
    products: (products || []).map(ordProductToReaction),
  });

export const reactionOutcomeToOrdOutcome = ({
  reactionTime,
  conversion,
  analyses,
  products,
}: ReactionOutcome): ord.IReactionOutcome => ({
  reactionTime: reactionTimeToOrd(reactionTime),
  conversion,
  analyses: Object.values(analyses || {}).reduce(
    (acc, value) => ({
      ...acc,
      [value.name]: reactionAnalysisToOrdAnalysis(value),
    }),
    {},
  ),
  products: products.map(reactionProductToOrd),
});

export const ordOutcomesListToReactionOutcomesList = (
  outcomes: Array<ord.IReactionOutcome>,
): Array<ReactionOutcome> => {
  return outcomes.map(ordOutcomeToReactionOutcome);
};

export const reactionOutcomesListToOrdOutcomesList = (
  outcomes: Array<ReactionOutcome>,
): Array<ord.IReactionOutcome> => {
  return outcomes.map(reactionOutcomeToOrdOutcome);
};

export const linkReactionOutcome = (outcome: ReactionOutcome): ReactionOutcome => {
  const analysesById = outcome.analyses;
  const analysesByNames = itemsById(Object.values(outcome.analyses), item => item.name);

  return {
    ...outcome,
    products: outcome.products.map(product => ({
      ...product,
      measurements: product.measurements.map(measurement => {
        const updatedMeasurement = { ...measurement };
        if (updatedMeasurement.analysis) {
          const { name, id } = updatedMeasurement.analysis;
          const analysis = (id ? analysesById[id] : analysesByNames[name]) ?? null;
          updatedMeasurement.analysis = analysis ? { name: analysis.name, id: analysis.id } : null;
        }
        return updatedMeasurement;
      }),
    })),
  };
};
