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
import { type ReactionFormNode, ReactionFormNodeType } from 'common/types/reaction/reactionFields.ts';
import { ord } from 'ord-schema-protobufjs';
import { ordMapToKeyValueObject } from 'common/utils/reactionForm/ordMapToKeyValueObject.ts';

const speedOptions = ordMapToKeyValueObject(ord.ReactionInput.AdditionSpeed.AdditionSpeedType);

const deviceOptions = ordMapToKeyValueObject(ord.ReactionInput.AdditionDevice.AdditionDeviceType);

const timeOptions = ordMapToKeyValueObject(ord.Time.TimeUnit);

const temperatureOptions = ordMapToKeyValueObject(ord.Temperature.TemperatureUnit);

const flowRateOptions = ordMapToKeyValueObject(ord.FlowRate.FlowRateUnit);

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
    type: ReactionFormNodeType.wrapper,
    grid: 2,
    fields: [
      {
        type: ReactionFormNodeType.value,
        name: 'additionOrder',
        inputType: 'number',
        wrapperConfig: {
          label: 'Order',
          hint: 'Order of the input',
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
        name: 'additionSpeed.type',
        selectType: 'dropdown',
        options: speedOptions,
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
    ],
  },
  {
    type: ReactionFormNodeType.wrapper,
    grid: 2,
    fields: [
      {
        type: ReactionFormNodeType.select,
        name: 'additionDevice.type',
        selectType: 'dropdown',
        options: deviceOptions,
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
    ],
  },
  {
    type: ReactionFormNodeType.vpu,
    name: 'additionTime',
    wrapperConfig: {
      label: 'Time',
      hint: 'Addition time is relative to when the first input was added',
    },
    options: timeOptions,
  },
  {
    type: ReactionFormNodeType.vpu,
    name: 'additionDuration',
    wrapperConfig: {
      label: 'Duration',
      hint: 'Addition time is relative to when the first input was added',
    },
    options: timeOptions,
  },
  {
    type: ReactionFormNodeType.vpu,
    name: 'additionTemperature',
    wrapperConfig: {
      label: 'Temperature',
      hint: 'Addition time is relative to when the first input was added',
    },
    options: temperatureOptions,
  },
  {
    type: ReactionFormNodeType.vpu,
    name: 'flowRate',
    wrapperConfig: {
      label: 'Flow rate',
    },
    options: flowRateOptions,
    useNativeSelect: true,
  },
];
