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
import { type ReactionFormNode, ReactionFormNodeType } from 'common/types/reaction/reactionFields';
import { createValuePrecisionUnitInputs } from '../../utils/reactionForm/createValuePrecisionUnitInputs';
import reactionSchema from 'ord-schema/proto/reaction_pb';

const ordMapToKeyValueObject = <T extends object, K extends keyof T>(ordMap: Record<K, number>) =>
  Object.entries<number>(ordMap).map(([key, value]) => ({
    label: key.toString(),
    value: value.toString(),
  }));

const speedOptions = ordMapToKeyValueObject(reactionSchema.ReactionInput.AdditionSpeed.AdditionSpeedType);

const deviceOptions = ordMapToKeyValueObject(reactionSchema.ReactionInput.AdditionDevice.AdditionDeviceType);

const timeOptions = ordMapToKeyValueObject(reactionSchema.Time.TimeUnit);

const temperatureOptions = ordMapToKeyValueObject(reactionSchema.Temperature.TemperatureUnit);

export const reactionInputs: Array<ReactionFormNode> = [
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
  createValuePrecisionUnitInputs({
    name: 'additionTime',
    label: 'Time',
    unitOptions: timeOptions,
    hint: 'Addition time is relative to when the first input was added',
  }),
  createValuePrecisionUnitInputs({
    name: 'additionDuration',
    label: 'Duration',
    unitOptions: timeOptions,
    hint: 'Addition time is relative to when the first input was added',
  }),
  createValuePrecisionUnitInputs({
    name: 'additionTemperature',
    label: 'Temperature',
    unitOptions: temperatureOptions,
    hint: 'Addition time is relative to when the first input was added',
  }),
];
