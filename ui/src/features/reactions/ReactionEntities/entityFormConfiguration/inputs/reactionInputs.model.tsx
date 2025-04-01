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
import { InputsComponentList } from 'features/reactions/ReactionEntities/entityFormConfiguration/inputs/InputsComponentsList/InputsComponentList.tsx';
import { wrapInputsWithGrid } from 'common/utils/reactionForm/wrapInputsWithGrid.ts';
import {
  additionDeviceTypeOptions,
  additionSpeedTypeOptions,
  flowRateOptions,
  temperatureOptions,
  timeTypeOptions,
} from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.models.ts';
import { buildUseSelectItems } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import { createEntityListItemComponent } from 'features/reactions/ReactionEntities/entityFormConfiguration/EntityListItem/entityListItem.utils.tsx';
import type { ReactionCrudeComponent } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import { buildUseCreate } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseCreate.ts';
import { ordCrudeComponentToReaction } from 'store/entities/reactions/reactionsInputs/reactionsInputs.converters.ts';
import { ord } from 'ord-schema-protobufjs';
import { CrudeComponentView } from 'features/reactions/ReactionView/CrudeComponentView/CrudeComponentView.tsx';

const createEmptyCrudeComponent = buildUseCreate('crudeComponents', index => {
  const newCrudeComponent = ordCrudeComponentToReaction(ord.CrudeComponent.toObject(new ord.CrudeComponent()));
  return [index, newCrudeComponent];
});

export const reactionInputs: Array<ReactionFormNode> = [
  {
    type: ReactionFormNodeType.wrapper,
    grid: 2,
    fields: [
      {
        type: ReactionFormNodeType.value,
        name: 'name',
        inputType: 'string',
        wrapperConfig: {
          label: 'Input name',
        },
      },
    ],
  },
  {
    type: ReactionFormNodeType.custom,
    name: 'components',
    Component: InputsComponentList,
  },
  {
    type: ReactionFormNodeType.list,
    title: {
      label: 'Crude components',
    },
    getKey: (_, index) => index,
    useSelectItems: buildUseSelectItems('crudeComponents'),
    ItemDisplay: createEntityListItemComponent<ReactionCrudeComponent>({
      entityField: 'crudeComponents',
      title: 'Crude component',
      requiredFields: [
        {
          label: 'reactionId',
          render: value => <CrudeComponentView crudeComponent={value} />,
        },
      ],
    }),
    addItem: {
      label: 'Crude Component',
      useCreate: createEmptyCrudeComponent,
    },
  },
  {
    type: ReactionFormNodeType.block,
    title: {
      label: 'Addition Information',
    },
    fields: [
      {
        type: ReactionFormNodeType.wrapper,
        grid: 2,
        fields: [
          {
            type: ReactionFormNodeType.value,
            name: 'additionOrder',
            inputType: 'number',
            wrapperConfig: {
              label: 'Order',
              hint: 'Order should be an integer value, starting at 1',
            },
          },
        ],
      },
      {
        type: ReactionFormNodeType.objectInitializer,
        name: 'additionSpeed',
        field: wrapInputsWithGrid(
          {
            type: ReactionFormNodeType.select,
            name: 'additionSpeed.type',
            selectType: 'dropdown',
            options: additionSpeedTypeOptions,
            wrapperConfig: {
              label: 'Speed',
            },
          },
          {
            type: ReactionFormNodeType.value,
            name: 'additionSpeed.details',
            inputType: 'string',
            wrapperConfig: {
              label: 'Speed details',
            },
          },
        ),
      },
      {
        type: ReactionFormNodeType.objectInitializer,
        name: 'additionDevice',
        field: wrapInputsWithGrid(
          {
            type: ReactionFormNodeType.select,
            name: 'additionDevice.type',
            selectType: 'dropdown',
            options: additionDeviceTypeOptions,
            wrapperConfig: {
              label: 'Device',
            },
          },
          {
            type: ReactionFormNodeType.value,
            name: 'additionDevice.details',
            inputType: 'string',
            wrapperConfig: {
              label: 'Device details',
            },
          },
        ),
      },
      {
        type: ReactionFormNodeType.vpu,
        name: 'additionTime',
        wrapperConfig: {
          label: 'Time',
          hint: 'Addition time is relative to when the first input was added',
        },
        options: timeTypeOptions,
      },
      {
        type: ReactionFormNodeType.vpu,
        name: 'additionDuration',
        wrapperConfig: {
          label: 'Duration',
          hint: 'Addition duration quantifies how long it took to add the input',
        },
        options: timeTypeOptions,
      },
      {
        type: ReactionFormNodeType.vpu,
        name: 'additionTemperature',
        wrapperConfig: {
          label: 'Temperature',
          hint: 'Addition temperature specifies if the reaction input was heated or cooled prior to addition',
        },
        options: temperatureOptions,
      },
    ],
  },
  {
    type: ReactionFormNodeType.block,
    title: {
      label: 'Flow rate',
      hint: 'Infusion rate when running reactions in continuous flow.',
    },
    fields: [
      {
        type: ReactionFormNodeType.vpu,
        name: 'flowRate',
        options: flowRateOptions,
        select: 'native',
        wrapperConfig: {
          templateLabel: 'Flow Rate',
        },
      },
    ],
  },
];
