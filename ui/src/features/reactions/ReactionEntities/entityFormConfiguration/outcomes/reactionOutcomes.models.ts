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
  type ReactionFormNode,
  ReactionFormNodeType,
} from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { ord } from 'ord-schema-protobufjs';
import { ordMapToKeyValueObject } from 'common/utils/reactionForm/ordMapToKeyValueObject.ts';
import { buildUseSelectItemsListFromMap } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import { createEntityListItemComponent } from 'features/reactions/ReactionEntities/entityFormConfiguration/EntityListItem/entityListItem.utils.tsx';
import type { AppReactionAnalysis } from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.types.ts';
import { reversePrimitiveRecord } from 'common/utils/reversePrimitiveRecord.ts';
import { findReactionEntityUniqueName } from 'features/reactions/ReactionEntities/findReactionEntityUniqueName.ts';
import { ordAnalysisToReactionAnalysis } from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.converters.ts';
import { buildUseCreate } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseCreate.ts';
import { compareNamedEntities } from 'features/reactions/ReactionEntities/entityFormConfiguration/compareNamedEntities.ts';

const timeOptions = ordMapToKeyValueObject(ord.Time.TimeUnit);

const analysisLabelByValue = reversePrimitiveRecord(ord.Analysis.AnalysisType);

const createEmptyAnalysis = (_: number, analyses: Array<unknown>): [string, AppReactionAnalysis] => {
  const uniqueName = findReactionEntityUniqueName(
    'Analysis',
    (analyses as Array<AppReactionAnalysis>).map(({ name }) => name),
  );
  const analysis = ordAnalysisToReactionAnalysis(ord.Analysis.toObject(new ord.Analysis()), uniqueName);
  return [analysis.id, analysis];
};

export const reactionOutcomes: Array<ReactionFormNode> = [
  {
    type: ReactionFormNodeType.vpu,
    name: 'reactionTime',
    wrapperConfig: {
      label: 'Time',
      hint: 'The reaction time at which this analysis/characterization was performed.',
    },
    options: timeOptions,
  },
  {
    type: ReactionFormNodeType.objectInitializer,
    name: 'conversion',
    field: {
      type: ReactionFormNodeType.wrapper,
      grid: 2,
      wrapperConfig: {
        label: 'Limiting reactant conversion',
        hint: 'Reaction conversion with respect to the limiting reactant. Yields should be associated with specific product structures, defined below.',
      },
      fields: [
        {
          type: ReactionFormNodeType.group,
          fields: [
            {
              type: ReactionFormNodeType.value,
              name: 'value',
              inputType: 'number',
              inputConfig: {
                placeholder: 'Value',
              },
            },
            {
              type: ReactionFormNodeType.value,
              name: 'precision',
              inputType: 'number',
              inputConfig: {
                leftSection: '±',
                placeholder: 'Precision',
              },
            },
          ],
        },
      ],
    },
  },
  {
    type: ReactionFormNodeType.list,
    getKey: (item: AppReactionAnalysis) => item.id,
    title: {
      label: 'Analyses',
    },
    useSelectItems: buildUseSelectItemsListFromMap('analyses', compareNamedEntities),
    ItemDisplay: createEntityListItemComponent<AppReactionAnalysis>({
      entityField: 'analyses',
      title: entity => entity.name,
      requiredFields: [
        {
          label: 'Type',
          render: item => analysisLabelByValue[item.type ?? 0],
        },
        {
          label: 'Details',
          render: item => item.details,
        },
        {
          label: 'Instrument calibration date',
          render: item => item.instrumentLastCalibrated,
        },
      ],
    }),
    addItem: {
      label: 'Analysis',
      useCreate: buildUseCreate('analyses', createEmptyAnalysis),
    },
  },
];
