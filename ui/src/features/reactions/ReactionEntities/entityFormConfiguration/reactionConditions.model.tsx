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
  atmosphereTypeOptions,
  currentTypeOptions,
  electrochemistryCellTypeOptions,
  electrochemistryTypeOptions,
  flowTypeOptions,
  illuminationTypeOptions,
  lengthTypeOptions,
  pressureControlTypeOptions,
  pressureUnitOptions,
  stirringMethodTypeOptions,
  stirringRateOptions,
  temperatureControlTypeOptions,
  temperatureOptions,
  tubingTypeOptions,
  waveLengthTypeOptions,
} from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.models';
import { buildUseSelectItems } from './buildUseSelectItems.ts';
import { createEntityListItemComponent } from './EntityListItem/entityListItem.utils.tsx';
import type {
  ElectrochemistryMeasurement,
  PressureMeasurement,
  TemperatureMeasurement,
} from 'store/entities/reactions/reactionConditions/reactionConditions.types.ts';
import { buildUseCreate } from './buildUseCreate.ts';
import { ord } from 'ord-schema-protobufjs';
import {
  ordElectrochemistryMeasurementToReaction,
  ordPressureMeasurementToReaction,
  ordTemperatureMeasurementToReaction,
} from 'store/entities/reactions/reactionConditions/reactionConditions.converter.ts';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type { FieldConfiguration } from 'common/components/display/RequiredOptionalFields/requiredOptionalFields.types.ts';
import { renderValuePrecisionUnit } from '../../ReactionView/renderValuePrecisionUnit.ts';

const temperatureMeasurementsPathComponents = ['temperature', 'temperatureMeasurements'];

const electrochemistryMeasurementsPathComponents = ['electrochemistry', 'electrochemistryMeasurements'];

const pressureMeasurementsPathComponents = ['pressure', 'pressureMeasurements'];

function createMeasurementListItem<T>(
  pathComponents: ReactionPathComponents,
  createEmpty: () => T,
  requiredFields: Array<FieldConfiguration<T>>,
): ReactionFormNode {
  return {
    type: ReactionFormNodeType.list,
    name: pathComponents.join('.'),
    getKey: (_, index) => index,
    title: {
      label: 'Measurements',
    },
    useSelectItems: buildUseSelectItems(pathComponents),
    ItemDisplay: createEntityListItemComponent<T>({
      entityField: pathComponents,
      title: 'Measurement',
      requiredFields: requiredFields,
    }),
    addItem: {
      label: 'Measurement',
      useCreate: buildUseCreate(pathComponents, index => {
        return [index, createEmpty()];
      }),
    },
  };
}

export const reactionTemperatureCondition: ReactionFormNode = {
  type: ReactionFormNodeType.block,
  name: 'temperature',
  title: {
    label: 'Temperature',
  },
  fields: [
    wrapInputsWithGrid(
      {
        type: ReactionFormNodeType.select,
        name: 'temperature.control.type',
        selectType: 'dropdown',
        options: temperatureControlTypeOptions,
        wrapperConfig: {
          label: 'Control',
        },
      },
      {
        type: ReactionFormNodeType.value,
        name: 'temperature.control.details',
        inputType: 'string',
        wrapperConfig: {
          label: 'Details',
        },
      },
    ),
    {
      type: ReactionFormNodeType.vpu,
      name: 'temperature.setpoint',
      wrapperConfig: {
        label: 'Setpoint',
        hint: 'Addition temperature specifies if the reaction input was heated or cooled prior to addition',
      },
      options: temperatureOptions,
    },
    createMeasurementListItem<TemperatureMeasurement>(
      temperatureMeasurementsPathComponents,
      () =>
        ordTemperatureMeasurementToReaction(
          ord.TemperatureConditions.TemperatureMeasurement.toObject(
            new ord.TemperatureConditions.TemperatureMeasurement(),
          ),
        ),
      [
        {
          label: 'Type',
          render: item => item.type,
        },
      ],
    ),
  ],
};

export const reactionStirringCondition: ReactionFormNode = {
  type: ReactionFormNodeType.block,
  name: 'stirring',
  title: {
    label: 'Stirring',
  },
  fields: [
    wrapInputsWithGrid(
      {
        type: ReactionFormNodeType.select,
        name: 'stirring.type',
        selectType: 'dropdown',
        options: stirringMethodTypeOptions,
        wrapperConfig: {
          label: 'Method',
        },
      },
      {
        type: ReactionFormNodeType.value,
        name: 'stirring.details',
        inputType: 'string',
        wrapperConfig: {
          label: 'Details',
        },
      },
    ),
    wrapInputsWithGrid(
      {
        type: ReactionFormNodeType.select,
        name: 'stirring.rate.type',
        selectType: 'segmented',
        options: stirringRateOptions,
        wrapperConfig: {
          label: 'Rate',
        },
      },
      {
        type: ReactionFormNodeType.value,
        name: 'stirring.rate.details',
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
          name: 'stirring.rate.rpm',
          inputType: 'number',
          wrapperConfig: {
            label: 'RPM',
          },
        },
      ],
    },
  ],
};

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
        label: 'Dynamic Conditions',
        hint: 'Whether the reaction conditions cannot be fully described by the fields in this schema/form.',
      },
    },
  ),
  {
    type: ReactionFormNodeType.value,
    name: 'details',
    inputType: 'textarea',
    wrapperConfig: {
      label: 'Details',
      hint: 'Elaboration on the aspects of the reaction conditions that cannot be captured by this schema in a structured format.',
    },
  },
  reactionTemperatureCondition,
  reactionStirringCondition,
  {
    type: ReactionFormNodeType.block,
    name: 'pressure',
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
            name: 'pressure.control.type',
            selectType: 'dropdown',
            options: pressureControlTypeOptions,
            wrapperConfig: {
              label: 'Control',
            },
          },
          {
            type: ReactionFormNodeType.value,
            name: 'pressure.control.details',
            inputType: 'string',
            wrapperConfig: {
              label: 'Details',
            },
          },
        ],
      },
      {
        type: ReactionFormNodeType.vpu,
        name: 'pressure.setpoint',
        options: pressureUnitOptions,
        wrapperConfig: {
          label: 'Pressure',
        },
        select: 'native',
      },
      wrapInputsWithGrid(
        {
          type: ReactionFormNodeType.select,
          name: 'pressure.atmosphere.type',
          selectType: 'dropdown',
          options: atmosphereTypeOptions,
          wrapperConfig: {
            label: 'Atmosphere',
          },
        },
        {
          type: ReactionFormNodeType.value,
          name: 'pressure.atmosphere.details',
          inputType: 'string',
          wrapperConfig: {
            label: 'Details',
          },
        },
      ),
      createMeasurementListItem<PressureMeasurement>(
        pressureMeasurementsPathComponents,
        () =>
          ordPressureMeasurementToReaction(
            ord.PressureConditions.PressureMeasurement.toObject(new ord.PressureConditions.PressureMeasurement()),
          ),
        [
          {
            label: 'Type',
            render: item => item.type,
          },
        ],
      ),
    ],
  },
  {
    type: ReactionFormNodeType.block,
    name: 'illumination',
    title: {
      label: 'Illumination',
    },
    fields: [
      wrapInputsWithGrid(
        {
          type: ReactionFormNodeType.select,
          name: 'illumination.type',
          selectType: 'dropdown',
          options: illuminationTypeOptions,
          wrapperConfig: {
            label: 'Type',
          },
        },
        {
          type: ReactionFormNodeType.value,
          name: 'illumination.details',
          inputType: 'string',
          wrapperConfig: {
            label: 'Details',
          },
        },
      ),
      {
        type: ReactionFormNodeType.vpu,
        name: 'illumination.peakWavelength',
        options: waveLengthTypeOptions,
        wrapperConfig: {
          label: 'Wavelength',
        },
        select: 'native',
      },
      {
        type: ReactionFormNodeType.vpu,
        name: 'illumination.distanceToVessel',
        options: lengthTypeOptions,
        wrapperConfig: {
          label: 'Distance',
        },
        select: 'native',
      },
      {
        type: ReactionFormNodeType.wrapper,
        grid: 2,
        fields: [
          {
            type: ReactionFormNodeType.value,
            name: 'illumination.color',
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
    name: 'electrochemistry',
    title: {
      label: 'Electrochemistry',
    },
    fields: [
      wrapInputsWithGrid(
        {
          type: ReactionFormNodeType.select,
          name: 'electrochemistry.type',
          selectType: 'dropdown',
          options: electrochemistryTypeOptions,
          wrapperConfig: {
            label: 'Type',
          },
        },
        {
          type: ReactionFormNodeType.value,
          name: 'electrochemistry.details',
          inputType: 'string',
          wrapperConfig: {
            label: 'Details',
          },
        },
      ),
      {
        type: ReactionFormNodeType.vpu,
        name: 'electrochemistry.current',
        options: currentTypeOptions,
        wrapperConfig: {
          label: 'Current',
        },
        select: 'native-inline',
      },
      wrapInputsWithGrid(
        {
          type: ReactionFormNodeType.value,
          name: 'electrochemistry.anodeMaterial',
          inputType: 'string',
          wrapperConfig: {
            label: 'Anode',
          },
        },
        {
          type: ReactionFormNodeType.value,
          name: 'electrochemistry.cathodeMaterial',
          inputType: 'string',
          wrapperConfig: {
            label: 'Cathode',
          },
        },
      ),
      {
        type: ReactionFormNodeType.vpu,
        name: 'electrochemistry.electrodeSeparation',
        options: lengthTypeOptions,
        wrapperConfig: {
          label: 'Separation',
        },
        select: 'native',
      },
      wrapInputsWithGrid(
        {
          type: ReactionFormNodeType.select,
          name: 'electrochemistry.cell.type',
          selectType: 'dropdown',
          options: electrochemistryCellTypeOptions,
          wrapperConfig: {
            label: 'Cell',
          },
        },
        {
          type: ReactionFormNodeType.value,
          name: 'electrochemistry.cell.details',
          inputType: 'string',
          wrapperConfig: {
            label: 'Details',
          },
        },
      ),
      createMeasurementListItem<ElectrochemistryMeasurement>(
        electrochemistryMeasurementsPathComponents,
        () =>
          ordElectrochemistryMeasurementToReaction(
            ord.ElectrochemistryConditions.ElectrochemistryMeasurement.toObject(
              new ord.ElectrochemistryConditions.ElectrochemistryMeasurement(),
            ),
          ),
        [
          {
            label: 'Time',
            render: item => (item.time ? renderValuePrecisionUnit(item.time) : ''),
          },
        ],
      ),
    ],
  },
  {
    type: ReactionFormNodeType.block,
    name: 'flow',
    title: {
      label: 'Flow',
    },
    fields: [
      wrapInputsWithGrid(
        {
          type: ReactionFormNodeType.select,
          name: 'flow.type',
          selectType: 'dropdown',
          options: flowTypeOptions,
          wrapperConfig: {
            label: 'Type',
          },
        },
        {
          type: ReactionFormNodeType.value,
          name: 'flow.details',
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
            name: 'flow.pumpType',
            inputType: 'string',
            wrapperConfig: {
              label: 'Pump',
            },
          },
        ],
      },
      wrapInputsWithGrid(
        {
          type: ReactionFormNodeType.select,
          name: 'flow.tubing.type',
          selectType: 'dropdown',
          options: tubingTypeOptions,
          wrapperConfig: {
            label: 'Tubing',
          },
        },
        {
          type: ReactionFormNodeType.value,
          name: 'flow.tubing.details',
          inputType: 'string',
          wrapperConfig: {
            label: 'Details',
          },
        },
      ),
      {
        type: ReactionFormNodeType.vpu,
        name: 'flow.tubing.diameter',
        options: lengthTypeOptions,
        wrapperConfig: {
          label: 'Diameter',
        },
        select: 'native',
      },
    ],
  },
];
