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
import type { ord } from 'ord-schema-protobufjs';
import type { AppReaction } from 'store/reactions/reactions.types';

export const ordInputsToAppInputs = (inputs: ord.IReaction['inputs']): AppReaction['inputs'] =>
  !inputs
    ? []
    : Object.entries(inputs).map(([key, value]) => ({
        ...value,
        name: key,
      }));

export const appInputsToOrdInputs = (inputs: AppReaction['inputs']): ord.IReaction['inputs'] =>
  inputs.reduce(
    (acc, { name, ...item }) => ({
      ...acc,
      [name]: item,
    }),
    {},
  );
