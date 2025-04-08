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
  type ReactionFormConditionalRendering,
  type ReactionFormNode,
  ReactionFormNodeType,
} from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import {
  massSpecTypeOptions,
  measurementsTypeOptions,
  selectivityTypeOptions,
  timeUnitOptions,
  waveLengthTypeOptions,
} from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.models.ts';
import { booleanOptions } from 'features/reactions/ReactionEntities/entityFormConfiguration/booleanOptions.ts';
import type { ReactionMeasurementType } from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.types.ts';
import { wrapInputsWithGrid } from 'common/utils/reactionForm/wrapInputsWithGrid.ts';
import { MeasurementsBasedOn } from 'features/reactions/ReactionEntities/entityFormConfiguration/measurements/MeasurementsBasedOn.tsx';
import { MeasurementValueControl } from 'features/reactions/ReactionEntities/entityFormConfiguration/measurements/MeasurementValueControl/MeasurementValueControl.tsx';
import { MeasurementMasses } from 'features/reactions/ReactionEntities/entityFormConfiguration/measurements/MeasurementMasses.tsx';
import { MeasurementsDivider } from 'features/reactions/ReactionEntities/entityFormConfiguration/measurements/MeasurementsDivider.tsx';
import { AuthenticStandard } from 'features/reactions/ReactionEntities/entityFormConfiguration/measurements/AuthenticStandard/AuthenticStandard.tsx';
import { ReactionBoolean } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import {
  massSpecCompatibleTypes,
  retentionTimeCompatibleTypes,
  selectivityCompatibleTypes,
  valueCompatibleTypes,
  waveLengthCompatibleTypes,
} from 'features/reactions/ReactionEntities/entityFormConfiguration/measurements/reactionMeasurements.constants.ts';

const createCondition = (types: Array<ReactionMeasurementType>): ReactionFormConditionalRendering['condition'] => ({
  name: 'type',
  isHidden: (value: unknown) => !types.includes(value as ReactionMeasurementType),
});

export const reactionMeasurements: Array<ReactionFormNode> = [
  {
    type: ReactionFormNodeType.wrapper,
    grid: 2,
    fields: [
      {
        type: ReactionFormNodeType.select,
        selectType: 'dropdown',
        options: measurementsTypeOptions,
        name: 'type',
        wrapperConfig: {
          label: 'Type',
        },
      },
    ],
  },
  {
    type: ReactionFormNodeType.custom,
    name: '',
    Component: MeasurementsDivider,
  },
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.custom,
      name: 'analysis',
      Component: MeasurementsBasedOn,
    },
    {
      type: ReactionFormNodeType.value,
      name: 'details',
      inputType: 'string',
      wrapperConfig: {
        label: 'Details',
      },
    },
  ),
  {
    type: ReactionFormNodeType.custom,
    name: 'value',
    Component: MeasurementValueControl,
    condition: createCondition(valueCompatibleTypes),
  },
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.select,
      name: 'usesInternalStandard',
      selectType: 'segmented',
      options: booleanOptions,
      wrapperConfig: {
        label: 'Uses internal standard',
      },
    },
    {
      type: ReactionFormNodeType.select,
      name: 'isNormalized',
      selectType: 'segmented',
      options: booleanOptions,
      wrapperConfig: {
        label: 'Is normalized',
        hint: 'Whether the reported measurement has already been normalized to the internal standard, if an internal standard was used.',
      },
    },
    {
      type: ReactionFormNodeType.select,
      name: 'usesAuthenticStandard',
      selectType: 'segmented',
      options: booleanOptions,
      wrapperConfig: {
        label: 'Uses authentic standard',
      },
    },
  ),
  {
    type: ReactionFormNodeType.vpu,
    name: 'retentionTime',
    wrapperConfig: {
      label: 'Retention time',
    },
    select: 'segmented',
    options: timeUnitOptions,
    condition: createCondition(retentionTimeCompatibleTypes),
  },

  {
    type: ReactionFormNodeType.vpu,
    name: 'waveLength',
    wrapperConfig: {
      label: 'Wave length',
    },
    options: waveLengthTypeOptions,
    condition: createCondition(waveLengthCompatibleTypes),
  },
  {
    type: ReactionFormNodeType.objectInitializer,
    name: 'massSpecDetails',
    condition: createCondition(massSpecCompatibleTypes),
    field: {
      type: ReactionFormNodeType.empty,
      fields: [
        wrapInputsWithGrid(
          {
            type: ReactionFormNodeType.select,
            name: 'massSpecDetails.type',
            wrapperConfig: {
              label: 'Mass spec type',
            },
            selectType: 'dropdown',
            options: massSpecTypeOptions,
          },
          {
            type: ReactionFormNodeType.value,
            name: 'massSpecDetails.details',
            inputType: 'string',
            wrapperConfig: {
              label: 'Mass spec details',
            },
          },
        ),
        wrapInputsWithGrid(
          {
            type: ReactionFormNodeType.value,
            name: 'massSpecDetails.ticMinimumMz',
            inputType: 'number',
            wrapperConfig: {
              label: 'TIC minimum m/z',
            },
          },
          {
            type: ReactionFormNodeType.value,
            name: 'massSpecDetails.ticMaximumMz',
            inputType: 'number',
            wrapperConfig: {
              label: 'TIC maximum m/z',
            },
          },
          {
            type: ReactionFormNodeType.custom,
            name: 'massSpecDetails.eicMasses',
            Component: MeasurementMasses,
          },
        ),
      ],
    },
  },
  {
    type: ReactionFormNodeType.objectInitializer,
    name: 'selectivity',
    condition: createCondition(selectivityCompatibleTypes),
    field: {
      type: ReactionFormNodeType.wrapper,
      grid: 2,
      fields: [
        {
          type: ReactionFormNodeType.select,
          name: 'selectivity.type',
          selectType: 'dropdown',
          options: selectivityTypeOptions,
          wrapperConfig: {
            label: 'Selectivity type',
          },
        },
        {
          type: ReactionFormNodeType.value,
          name: 'selectivity.details',
          inputType: 'string',
          wrapperConfig: {
            label: 'Selectivity details',
          },
        },
      ],
    },
  },
  {
    type: ReactionFormNodeType.custom,
    condition: {
      name: 'usesAuthenticStandard',
      isHidden: isUsing => (isUsing as ReactionBoolean) !== ReactionBoolean.True,
    },
    name: 'authenticStandard',
    Component: AuthenticStandard,
  },
];
