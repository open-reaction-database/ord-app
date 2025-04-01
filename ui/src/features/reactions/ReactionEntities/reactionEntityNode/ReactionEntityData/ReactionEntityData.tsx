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
import type { ReactionEntityNodeProps } from 'features/reactions/ReactionEntities/reactionEntityNode/reactionEntityNode.types.ts';
import type { ReactionFormData } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { AppSegmentedControl } from 'common/components/inputs/AppSegmentedControl/AppSegmentedControl.tsx';
import { type AppData, AppDataType } from 'store/entities/reactions/reactionData/reactionData.types.ts';
import { useUncontrolled } from '@mantine/hooks';
import { type ChangeEvent, type ReactNode, useCallback, useContext } from 'react';
import { NumberInput, TextInput } from '@mantine/core';
import { FileControl } from 'common/components/inputs/FileControl/FileControl.tsx';
import type { FileControlValue } from 'common/components/inputs/FileControl/fileControl.types.ts';
import { reactionContext } from 'features/reactions/reactions.context.ts';
import { VariableType } from 'store/entities/templates/templates.types.ts';
import { ReactionValueLabelWrapper } from 'features/reactions/ReactionValueLabelWrapper.tsx';

const options = Object.values(AppDataType);

type StringEvent = ChangeEvent<HTMLInputElement>;

type ChangeType = StringEvent | string | FileControlValue | number | null;

interface ReactionEntityValueProps {
  name: string;
  label: ReactNode;
  value: AppData['data'];
  onChange: (value: ChangeType) => void;
  disabled?: boolean;
}

function ReactionEntityDataValue({ name, value, onChange, label, disabled }: Readonly<ReactionEntityValueProps>) {
  switch (value.type) {
    case AppDataType.Number:
      return (
        <NumberInput
          label={label}
          value={value.value as number}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case AppDataType.Url:
    case AppDataType.Text:
      return (
        <TextInput
          label={label}
          value={value.value as string}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case AppDataType.Upload:
      return (
        <FileControl
          name={name}
          value={value as FileControlValue}
          onChange={onChange}
          label={label}
          disabled={disabled}
        />
      );
    default:
      return null;
  }
}

export function ReactionEntityData({ formMethods, node }: Readonly<ReactionEntityNodeProps<ReactionFormData>>) {
  const { isViewOnly } = useContext(reactionContext);
  const { getInputProps } = formMethods;
  const [dataValue, onChange] = useUncontrolled<AppData['data']>({
    ...getInputProps('data'),
  });
  const name = formMethods.getValues()['name'];

  const labelType = dataValue.type === AppDataType.Number ? VariableType.Number : VariableType.String;

  const label = (
    <ReactionValueLabelWrapper
      name={`${node.name}.value`}
      type={labelType}
      wrapperConfig={{ label: 'Data' }}
    />
  );

  const typeLabel = (
    <ReactionValueLabelWrapper
      type={VariableType.String}
      wrapperConfig={{ label: 'Type', cannotBeVariable: true }}
      name={node.name}
    />
  );

  const formatLabel = (
    <ReactionValueLabelWrapper
      type={VariableType.String}
      wrapperConfig={{ label: 'Format' }}
      name={`${node.name}.format`}
    />
  );

  const onTypeChange = useCallback(
    (type: string) => {
      onChange({
        type: type as AppDataType,
        value: '',
        format: null,
      });
    },
    [onChange],
  );

  const onValueChange = (newValue: ChangeType) => {
    if (typeof newValue === 'object' && newValue !== null && 'format' in newValue) {
      onChange({ type: dataValue.type, ...newValue });
    } else if (newValue !== null && typeof newValue === 'object') {
      onChange({ type: dataValue.type, value: newValue.target.value });
    } else {
      onChange({ type: dataValue.type, value: newValue });
    }
  };

  return (
    <>
      <AppSegmentedControl
        options={options}
        fullWidth={false}
        onChange={onTypeChange}
        value={dataValue.type}
        label={typeLabel}
        disabled={isViewOnly}
      />
      <ReactionEntityDataValue
        name={name}
        onChange={onValueChange}
        value={dataValue}
        label={label}
        disabled={isViewOnly}
      />
      {dataValue.type === AppDataType.Upload && (
        <TextInput
          value={dataValue.format || ''}
          label={formatLabel}
          disabled
        />
      )}
    </>
  );
}
