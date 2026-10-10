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
import type { MessageInitShape } from '@bufbuild/protobuf';
import type {
  Analysis,
  AnalysisSchema,
  ReactionOutcome as OrdReactionOutcome,
  ReactionOutcomeSchema,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import {
  ordDataMapToReactionDataMap,
  reactionDataMapToOrdDataMap,
} from 'store/entities/reactions/reactionData/reactionData.converters.ts';
import {
  ordBooleanToReaction,
  ordScalarToReaction,
  ordTimeToReaction,
  ordValuePrecisionToReaction,
  reactionBooleanToOrd,
  reactionIntegerToOrd,
  reactionTimeToOrd,
  reactionValuePrecisionToOrd,
  withId,
  withIdName,
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

export const ordAnalysisToReaction = (
  {
    type,
    data,
    instrumentLastCalibrated,
    isOfIsolatedSpecies,
    details,
    chmoId,
    instrumentManufacturer,
  }: Analysis,
  name: string,
): ReactionAnalysis =>
  withIdName(
    {
      type: ordAnalysisTypeToReaction(type),
      analysisData: ordDataMapToReactionDataMap(data || {}),
      instrumentLastCalibrated: instrumentLastCalibrated?.value || null,
      isOfIsolatedSpecies: ordBooleanToReaction(isOfIsolatedSpecies),
      details: ordScalarToReaction(details),
      chmoId: ordScalarToReaction(chmoId),
      instrumentManufacturer: ordScalarToReaction(instrumentManufacturer),
    },
    name,
  );

export const reactionAnalysisToOrd = ({
  type,
  analysisData,
  instrumentLastCalibrated,
  isOfIsolatedSpecies,
  details,
  chmoId,
  instrumentManufacturer,
}: ReactionAnalysis): MessageInitShape<typeof AnalysisSchema> => ({
  type: reactionAnalysisTypeToOrd(type),
  data: reactionDataMapToOrdDataMap(analysisData),
  instrumentLastCalibrated: instrumentLastCalibrated
    ? { value: instrumentLastCalibrated }
    : undefined,
  isOfIsolatedSpecies: reactionBooleanToOrd(isOfIsolatedSpecies),
  details: details ?? undefined,
  chmoId: reactionIntegerToOrd(chmoId),
  instrumentManufacturer: instrumentManufacturer ?? undefined,
});

export const ordOutcomeToReactionOutcome = ({
  reactionTime,
  conversion,
  analyses,
  products,
}: OrdReactionOutcome): ReactionOutcome =>
  withId({
    reactionTime: ordTimeToReaction(reactionTime),
    conversion: ordValuePrecisionToReaction(conversion),
    analyses: Object.entries(analyses || {}).reduce((acc, [name, value]) => {
      const analysis = ordAnalysisToReaction(value, name);
      return {
        ...acc,
        [analysis.id]: analysis,
      };
    }, {}),
    products: (products || []).map(ordProductToReaction),
  });

export const reactionOutcomeToOrd = ({
  reactionTime,
  conversion,
  analyses,
  products,
}: ReactionOutcome): MessageInitShape<typeof ReactionOutcomeSchema> => ({
  reactionTime: reactionTimeToOrd(reactionTime),
  conversion: reactionValuePrecisionToOrd(conversion),
  analyses: Object.values(analyses || {}).reduce(
    (acc, value) => ({
      ...acc,
      [value.name]: reactionAnalysisToOrd(value),
    }),
    {},
  ),
  products: products.map(reactionProductToOrd),
});

export const ordOutcomesListToReactionOutcomesList = (
  outcomes: Array<OrdReactionOutcome>,
): Array<ReactionOutcome> => {
  return outcomes.map(ordOutcomeToReactionOutcome);
};

export const reactionOutcomesListToOrdOutcomesList = (
  outcomes: Array<ReactionOutcome>,
): Array<MessageInitShape<typeof ReactionOutcomeSchema>> => {
  return outcomes.map(reactionOutcomeToOrd);
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
          updatedMeasurement.analysis = analysis
            ? { name: analysis.name, id: analysis.id }
            : null;
        }
        return updatedMeasurement;
      }),
    })),
  };
};
