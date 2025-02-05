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
import type { InputProps } from '@mantine/core';
import type { SelectOptions } from '../selectOptions';

export enum ReactionFormNodeType {
  group = 'group',
  wrapper = 'wrapper',
  value = 'value',
  select = 'select',
}

interface ReactionFormNodeBase {
  type: ReactionFormNodeType;
}

export interface ReactionFormGroup extends ReactionFormNodeBase {
  type: ReactionFormNodeType.group;
  fields: Array<ReactionFormNode>;
}

interface ReactionFormStandaloneField {
  label: string;
  hint?: string;
}

interface ReactionFormField {
  wrapperConfig?: ReactionFormStandaloneField;
}

export interface ReactionFormWrapper extends ReactionFormNodeBase, ReactionFormField {
  type: ReactionFormNodeType.wrapper;
  grid: number;
  fields: Array<ReactionFormNode>;
}

export interface ReactionFormValue extends ReactionFormField, ReactionFormNodeBase {
  type: ReactionFormNodeType.value;
  name: string;
  inputType: 'string' | 'number' | 'textarea';
  inputConfig?: Pick<InputProps, 'leftSection' | 'rightSection'> & { placeholder?: string };
}

export interface ReactionFormSelect extends ReactionFormField, ReactionFormNodeBase {
  type: ReactionFormNodeType.select;
  name: string;
  options: SelectOptions<unknown>;
  selectType: 'segmented' | 'dropdown';
}

export type ReactionFormNode = ReactionFormGroup | ReactionFormWrapper | ReactionFormValue | ReactionFormSelect;
