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
import type { AppReactionAnalysis, AppReactionOutcome } from './reactionOutcomes.types.ts';
import type { ord } from 'ord-schema-protobufjs';
import { ordDataMapToReactionDataMap } from 'store/entities/reactions/reactionData/reactionData.converters.ts';
import {
  withId,
  withIdName,
  withoutId,
  withoutIdName,
} from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';

const ordAnalysisToReactionAnalysis = ({ data, ...rest }: ord.IAnalysis, name: string): AppReactionAnalysis =>
  withIdName(
    {
      data: ordDataMapToReactionDataMap(data || {}),
      ...rest,
    },
    name,
  );

const reactionAnalysisToOrdAnalysis = ({ data, ...rest }: AppReactionAnalysis): ord.IAnalysis =>
  withoutIdName({
    data: ordDataMapToReactionDataMap(data),
    ...rest,
  });

export const ordOutcomeToReactionOutcome = ({
  analyses,
  products,
  ...rest
}: ord.IReactionOutcome): AppReactionOutcome =>
  withId({
    analyses: Object.entries(analyses || {}).reduce(
      (acc, [name, value]) => ({
        ...acc,
        [name]: ordAnalysisToReactionAnalysis(value, name),
      }),
      {},
    ),
    products: (products || []).map(withId),
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
    products: products.map(withoutId),
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
