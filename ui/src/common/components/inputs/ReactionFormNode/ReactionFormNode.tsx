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
  type ReactionFormSelect,
  type ReactionFormValue,
  type ReactionFormGroup,
  type ReactionFormWrapper,
} from 'common/types/reaction/reactionFields';
import { Input, NumberInput, Textarea, TextInput } from '@mantine/core';
import type { FC } from 'react';
import { InputGroup } from '../InputGroup/InputGroup';
import classes from './reactionFormNode.module.scss';
import type { useForm } from '@mantine/form';
import { AppNativeSelect } from '../AppNativeSelect/AppNativeSelect';
import { AppSegmentedControl } from '../AppSegmentedControl/AppSegmentedControl';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetInputProps = ReturnType<typeof useForm<any>>['getInputProps'];

interface ReactionFormNodeProps<T extends ReactionFormNode = ReactionFormNode> {
  node: T;
  getInputProps: GetInputProps;
}

const nodeTypeToComponent = {
  [ReactionFormNodeType.value]: ReactionFormValue,
  [ReactionFormNodeType.select]: ReactionFormSelect,
  [ReactionFormNodeType.group]: ReactionFormGroup,
  [ReactionFormNodeType.wrapper]: ReactionFormWrapper,
};

export function ReactionFormGroup({ node, getInputProps }: Readonly<ReactionFormNodeProps<ReactionFormGroup>>) {
  return (
    <InputGroup>
      {node.fields.map((field, index) => (
        <ReactionFormNode
          key={index}
          node={field}
          getInputProps={getInputProps}
        />
      ))}
    </InputGroup>
  );
}

export function ReactionFormWrapper({ node, getInputProps }: Readonly<ReactionFormNodeProps<ReactionFormWrapper>>) {
  return (
    <Input.Wrapper {...(node.wrapperConfig || {})}>
      <div
        className={classes.wrapper}
        style={{ gridTemplateColumns: `repeat(${node.grid}, 1fr)` }}
      >
        {node.fields.map((field, index) => (
          <ReactionFormNode
            key={index}
            node={field}
            getInputProps={getInputProps}
          />
        ))}
      </div>
    </Input.Wrapper>
  );
}

export function ReactionFormValue({ node, getInputProps }: Readonly<ReactionFormNodeProps<ReactionFormValue>>) {
  const wrapperProps = node.wrapperConfig || {};
  const inputProps = Object.assign({ placeholder: 'Type' }, node.inputConfig || {});
  const props = { name: node.name, ...wrapperProps, ...inputProps };

  switch (node.inputType) {
    case 'textarea':
      return (
        <Textarea
          {...props}
          {...getInputProps(node.name)}
        />
      );
    case 'number':
      return (
        <NumberInput
          {...props}
          {...getInputProps(node.name)}
        />
      );
    case 'string':
      return (
        <TextInput
          {...props}
          {...getInputProps(node.name)}
        />
      );
    default:
      return null;
  }
}

export function ReactionFormSelect({ node, getInputProps }: Readonly<ReactionFormNodeProps<ReactionFormSelect>>) {
  const wrapperProps = node.wrapperConfig || {};
  return node.selectType === 'dropdown' ? (
    <AppNativeSelect
      name={node.name}
      options={node.options}
      {...wrapperProps}
      {...getInputProps(node.name)}
    />
  ) : (
    <Input.Wrapper {...wrapperProps}>
      <AppSegmentedControl
        name={node.name}
        options={node.options}
        fullWidth
        {...getInputProps(node.name)}
      />
    </Input.Wrapper>
  );
}

export function ReactionFormNode({ node, getInputProps }: Readonly<ReactionFormNodeProps>) {
  const Component = nodeTypeToComponent[node.type] as FC<ReactionFormNodeProps> | null;
  return Component ? (
    <Component
      node={node}
      getInputProps={getInputProps}
    />
  ) : null;
}
