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
import { wrapInputsWithGrid } from 'common/utils/reactionForm/wrapInputsWithGrid';
import { type ReactionFormNode, ReactionFormNodeType } from '../reactionEntities.types';
import { booleanOptions } from './booleanOptions';
import {
  pressureOption,
  reactionIdentifierTypeOptions,
  stirringRateOptions,
  temperatureOptions,
  atmosphereTypeOptions,
  temperatureControlTypeOptions,
  stirringMethodTypeOptions,
  illuminationTypeOptions,
  waveLengthTypeOptions,
  lengthTypeOptions,
  electrochemistryTypeOptions,
  currentTypeOptions,
  electrochemistryCellTypeOptions,
  flowTypeOptions,
  tubingTypeOptions,
} from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.models';

export const reactionConditions: Array<ReactionFormNode> = [
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.select,
      name: 'reflux',
      selectType: 'segmented',
      options: booleanOptions,
      wrapperConfig: {
        label: 'Reflux',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: 'ph',
      inputType: 'number',
      wrapperConfig: {
        label: 'pH',
      },
    },
    {
      type: ReactionFormNodeType.select,
      name: 'conditionsAreDynamic',
      selectType: 'segmented',
      options: booleanOptions,
      wrapperConfig: {
        label: 'Dinamic Conditions',
        hint: 'Whether the reaction conditions cannot be fully described by the fields in this schema/form.',
      },
    },
  ),
  {
    type: ReactionFormNodeType.value,
    name: 'generalDetails',
    inputType: 'textarea',
    wrapperConfig: {
      label: 'Details',
      hint: 'Elaboration on the aspects of the reaction conditions that cannot be captured by this schema in a structured format.',
    },
  },
  {
    type: ReactionFormNodeType.block,
    title: {
      label: 'Temperature',
    },
    fields: [
      wrapInputsWithGrid(
        {
          type: ReactionFormNodeType.select,
          name: 'temperatureControl',
          selectType: 'dropdown',
          options: temperatureControlTypeOptions,
          wrapperConfig: {
            label: 'Control',
          },
        },
        {
          type: ReactionFormNodeType.value,
          name: 'temperatureDetails',
          inputType: 'string',
          wrapperConfig: {
            label: 'Details',
          },
        },
      ),
      {
        type: ReactionFormNodeType.vpu,
        name: 'temperature',
        wrapperConfig: {
          label: 'Setpoint',
          hint: 'Addition temperature specifies if the reaction input was heated or cooled prior to addition',
        },
        options: temperatureOptions,
      },
    ],
  },
  {
    type: ReactionFormNodeType.block,
    title: {
      label: 'Stirring',
    },
    fields: [
      wrapInputsWithGrid(
        {
          type: ReactionFormNodeType.select,
          name: 'stirringMethod',
          selectType: 'dropdown',
          options: stirringMethodTypeOptions,
          wrapperConfig: {
            label: 'Method',
          },
        },
        {
          type: ReactionFormNodeType.value,
          name: 'stirringDetails',
          inputType: 'string',
          wrapperConfig: {
            label: 'Details',
          },
        },
      ),
      wrapInputsWithGrid(
        {
          type: ReactionFormNodeType.select,
          name: 'rate',
          selectType: 'segmented',
          options: stirringRateOptions,
          wrapperConfig: {
            label: 'Rate',
          },
        },
        {
          type: ReactionFormNodeType.value,
          name: 'rateDetails',
          inputType: 'string',
          wrapperConfig: {
            label: 'Details',
          },
        },
      ),
      {
        type: ReactionFormNodeType.wrapper,
        grid: 2,
        fields: [
          {
            type: ReactionFormNodeType.value,
            name: 'rpm',
            inputType: 'string',
            wrapperConfig: {
              label: 'RpM',
            },
          },
        ],
      },
    ],
  },
  {
    type: ReactionFormNodeType.block,
    title: {
      label: 'Pressure',
    },
    fields: [
      {
        type: ReactionFormNodeType.wrapper,
        grid: 2,
        fields: [
          {
            type: ReactionFormNodeType.select,
            name: 'pressureControl',
            selectType: 'dropdown',
            options: reactionIdentifierTypeOptions,
            wrapperConfig: {
              label: 'Control',
            },
          },
          {
            type: ReactionFormNodeType.value,
            name: 'pressureControlDetails',
            inputType: 'string',
            wrapperConfig: {
              label: 'Details',
            },
          },
        ],
      },
      wrapInputsWithGrid({
        type: ReactionFormNodeType.vpu,
        name: 'pressure',
        options: pressureOption,
        wrapperConfig: {
          label: 'Pressure',
        },
        select: 'native-inline',
      }),
      {
        type: ReactionFormNodeType.wrapper,
        grid: 2,
        fields: [
          {
            type: ReactionFormNodeType.select,
            name: 'atmosphere',
            selectType: 'dropdown',
            options: atmosphereTypeOptions,
            wrapperConfig: {
              label: 'Atmosphere',
            },
          },
          {
            type: ReactionFormNodeType.value,
            name: 'atmosphereDetails',
            inputType: 'string',
            wrapperConfig: {
              label: 'Details',
            },
          },
        ],
      },
    ],
  },
  {
    type: ReactionFormNodeType.block,
    title: {
      label: 'Illumination',
    },
    fields: [
      {
        type: ReactionFormNodeType.wrapper,
        grid: 2,
        fields: [
          {
            type: ReactionFormNodeType.select,
            name: 'illuminationType',
            selectType: 'dropdown',
            options: illuminationTypeOptions,
            wrapperConfig: {
              label: 'Type',
            },
          },
          {
            type: ReactionFormNodeType.value,
            name: 'illuminationDetails',
            inputType: 'string',
            wrapperConfig: {
              label: 'Details',
            },
          },
        ],
      },
      wrapInputsWithGrid({
        type: ReactionFormNodeType.vpu,
        name: 'peakWavelength',
        options: waveLengthTypeOptions,
        wrapperConfig: {
          label: 'Wavelength',
        },
        select: 'native-inline',
      }),
      wrapInputsWithGrid({
        type: ReactionFormNodeType.vpu,
        name: 'distanceToVessel',
        options: lengthTypeOptions,
        wrapperConfig: {
          label: 'Distance',
        },
        select: 'native-inline',
      }),
      {
        type: ReactionFormNodeType.wrapper,
        grid: 2,
        fields: [
          {
            type: ReactionFormNodeType.value,
            name: 'color',
            inputType: 'string',
            wrapperConfig: {
              label: 'Color',
            },
          },
        ],
      },
    ],
  },
  {
    type: ReactionFormNodeType.block,
    title: {
      label: 'Electrochemistry',
    },
    fields: [
      {
        type: ReactionFormNodeType.wrapper,
        grid: 2,
        fields: [
          {
            type: ReactionFormNodeType.select,
            name: 'electrochemistryType',
            selectType: 'dropdown',
            options: electrochemistryTypeOptions,
            wrapperConfig: {
              label: 'Type',
            },
          },
          {
            type: ReactionFormNodeType.value,
            name: 'electrochemistryDetails',
            inputType: 'string',
            wrapperConfig: {
              label: 'Details',
            },
          },
        ],
      },
      wrapInputsWithGrid({
        type: ReactionFormNodeType.vpu,
        name: 'current',
        options: currentTypeOptions,
        wrapperConfig: {
          label: 'Current',
        },
        select: 'native-inline',
      }),
      {
        type: ReactionFormNodeType.wrapper,
        grid: 2,
        fields: [
          {
            type: ReactionFormNodeType.value,
            name: 'anode',
            inputType: 'string',
            wrapperConfig: {
              label: 'Anode',
            },
          },
          {
            type: ReactionFormNodeType.value,
            name: 'cathode',
            inputType: 'string',
            wrapperConfig: {
              label: 'Cathode',
            },
          },
        ],
      },
      wrapInputsWithGrid({
        type: ReactionFormNodeType.vpu,
        name: 'separation',
        options: lengthTypeOptions,
        wrapperConfig: {
          label: 'Separation',
        },
        select: 'native-inline',
      }),
      {
        type: ReactionFormNodeType.wrapper,
        grid: 2,
        fields: [
          {
            type: ReactionFormNodeType.select,
            name: 'cell',
            selectType: 'dropdown',
            options: electrochemistryCellTypeOptions,
            wrapperConfig: {
              label: 'Cell',
            },
          },
          {
            type: ReactionFormNodeType.value,
            name: 'separationDetails',
            inputType: 'string',
            wrapperConfig: {
              label: 'Details',
            },
          },
        ],
      },
    ],
  },
  {
    type: ReactionFormNodeType.block,
    title: {
      label: 'Flow',
    },
    fields: [
      {
        type: ReactionFormNodeType.wrapper,
        grid: 2,
        fields: [
          {
            type: ReactionFormNodeType.select,
            name: 'FlowType',
            selectType: 'dropdown',
            options: flowTypeOptions,
            wrapperConfig: {
              label: 'Type',
            },
          },
          {
            type: ReactionFormNodeType.value,
            name: 'flowDetails',
            inputType: 'string',
            wrapperConfig: {
              label: 'Details',
            },
          },
        ],
      },
      {
        type: ReactionFormNodeType.wrapper,
        grid: 2,
        fields: [
          {
            type: ReactionFormNodeType.value,
            name: 'pumpType',
            inputType: 'string',
            wrapperConfig: {
              label: 'Pump',
            },
          },
        ],
      },
      {
        type: ReactionFormNodeType.wrapper,
        grid: 2,
        fields: [
          {
            type: ReactionFormNodeType.select,
            name: 'tubing',
            selectType: 'dropdown',
            options: tubingTypeOptions,
            wrapperConfig: {
              label: 'Tubing',
            },
          },
          {
            type: ReactionFormNodeType.value,
            name: 'tubingDetails',
            inputType: 'string',
            wrapperConfig: {
              label: 'Details',
            },
          },
        ],
      },
      wrapInputsWithGrid({
        type: ReactionFormNodeType.vpu,
        name: 'diameter',
        options: lengthTypeOptions,
        wrapperConfig: {
          label: 'Diameter',
        },
        select: 'native-inline',
      }),
    ],
  },
];
