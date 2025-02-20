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
import type { SelectOptions } from 'common/types/selectOptions.ts';
import type { FC, ReactNode } from 'react';
import type { useForm } from '@mantine/form';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type { EntityListItemRuntimeProps } from 'features/reactions/ReactionEntities/entityFormConfiguration/EntityListItem/entityListItem.types.ts';

export enum ReactionFormNodeType {
  group = 'group',
  wrapper = 'wrapper',
  value = 'value',
  select = 'select',
  vpu = 'vpu',
  objectInitializer = 'objectInitializer',
  block = 'block',
  list = 'list',
  data = 'data',
  custom = 'custom',
}

export interface ReactionFormNodeBase {
  type: ReactionFormNodeType;
}

export interface ReactionFormGroup extends ReactionFormNodeBase {
  type: ReactionFormNodeType.group;
  fields: Array<ReactionFormNode>;
}

export interface ReactionFormStandaloneField {
  label: string;
  hint?: string;
  children?: ReactNode;
}

export interface ReactionFormTitle extends ReactionFormStandaloneField {
  rightSection?: ReactNode;
}

export interface ReactionFormField {
  wrapperConfig?: ReactionFormStandaloneField;
}

export interface ReactionFormConditionalRendering {
  readonly condition?: {
    name: string;
    isHidden: (value: unknown) => boolean;
  };
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

export interface ReactionFormSelect extends ReactionFormField, ReactionFormNodeBase, ReactionFormConditionalRendering {
  type: ReactionFormNodeType.select;
  name: string;
  options: SelectOptions<unknown>;
  selectType: 'segmented' | 'dropdown';
}

export interface ReactionFormValuePrecisionUnit extends ReactionFormField, ReactionFormNodeBase, ReactionFormNodeBase {
  type: ReactionFormNodeType.vpu;
  name: string;
  options: SelectOptions<number | string>;
  select?: 'native' | 'native-inline' | 'segmented';
}

export interface ReactionFormObjectInitializer extends ReactionFormNodeBase {
  type: ReactionFormNodeType.objectInitializer;
  name: string;
  field: ReactionFormNode;
}

export interface ReactionFormBlock extends ReactionFormNodeBase {
  type: ReactionFormNodeType.block;
  title: ReactionFormTitle;
  fields: Array<ReactionFormNode>;
}

export interface ReactionFormData extends ReactionFormNodeBase {
  type: ReactionFormNodeType.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ReactionFormList<T = any> extends ReactionFormNodeBase {
  type: ReactionFormNodeType.list;
  title: ReactionFormStandaloneField;
  getKey: (item: T, index: number) => string | number;
  addItem?: {
    label: string;
    useCreate: () => (index: number, list: Array<T>) => void;
  };
  useSelectItems: () => Array<T>;
  ItemDisplay: FC<EntityListItemRuntimeProps<T>>;
}

export type ReactionFormMethods = Pick<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReturnType<typeof useForm<any>>,
  'getInputProps' | 'watch' | 'getValues' | 'setValues' | 'resetDirty'
>;

export interface ReactionFormCustomProps {
  name: string;
  formMethods: ReactionFormMethods;
}

export interface ReactionFormCustom extends ReactionFormNodeBase {
  type: ReactionFormNodeType.custom;
  name: string;
  Component: FC<ReactionFormCustomProps>;
}

export type ReactionFormNode =
  | ReactionFormGroup
  | ReactionFormWrapper
  | ReactionFormValue
  | ReactionFormSelect
  | ReactionFormObjectInitializer
  | ReactionFormValuePrecisionUnit
  | ReactionFormBlock
  | ReactionFormList
  | ReactionFormData
  | ReactionFormCustom;

export interface ReactionEntityContext {
  pathComponents: ReactionPathComponents;
  reactionId: number;
}
