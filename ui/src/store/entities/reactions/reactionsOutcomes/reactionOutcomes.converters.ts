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
import { ordDataMapToReactionDataMap } from 'store/entities/reactions/reactionData/reactionData.converters.ts';

const ordAnalysisToReactionAnalysis = ({ data, ...rest }: ord.IAnalysis, name: string): AppReactionAnalysis => ({
  id: crypto.randomUUID(),
  name,
  ...rest,
  data: ordDataMapToReactionDataMap(data || {}),
});

const reactionAnalysisToOrdAnalysis = ({ id, name, data, ...rest }: AppReactionAnalysis): ord.IAnalysis => ({
  ...rest,
  data: ordDataMapToReactionDataMap(data),
});

const ordProductToReactionProduct = (product: ord.IProductCompound): AppReactionProduct => ({
  id: crypto.randomUUID(),
  ...product,
});

const reactionProductToOrdProduct = ({ id: _, ...product }: AppReactionProduct): ord.IProductCompound => product;

export const ordOutcomeToReactionOutcome = ({
  analyses,
  products,
  ...rest
}: ord.IReactionOutcome): AppReactionOutcome => ({
  id: crypto.randomUUID(),
  analyses: Object.entries(analyses || {}).reduce(
    (acc, [name, value]) => ({
      ...acc,
      [name]: ordAnalysisToReactionAnalysis(value, name),
    }),
    {},
  ),
  products: (products || []).map(ordProductToReactionProduct),
  ...rest,
});

export const reactionOutcomeToOrdOutcome = ({
  id: _,
  analyses,
  products,
  ...rest
}: AppReactionOutcome): ord.IReactionOutcome => ({
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
