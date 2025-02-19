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
import { ordMapToKeyValueObject } from 'common/utils/reactionForm/ordMapToKeyValueObject.ts';
import { type AppData, AppDataType } from 'store/entities/reactions/reactionData/reactionData.types.ts';
import mime from 'mime/lite';
import { useUncontrolled } from '@mantine/hooks';
import { type ChangeEvent, useCallback } from 'react';
import { ActionIcon, FileInput, Flex, Input, NumberInput, TextInput } from '@mantine/core';
import { Buffer } from 'buffer';
import { RemoveIcon } from 'common/icons';
import { inputWrapperClasses } from 'common/components/display/InputWrapper';
import { useFileNameHref } from 'features/reactions/ReactionEntities/useFileNameHref.ts';

const options = ordMapToKeyValueObject(AppDataType as Record<string, AppDataType>);

type StringEvent = ChangeEvent<HTMLInputElement>;

type ChangeType = StringEvent | string | [string, string] | number | null;

interface ReactionEntityValueProps {
  readonly name: string;
  readonly value: AppData['data'];
  readonly onChange: (value: ChangeType) => void;
}

function ReactionEntityDataFile({ value, name, onChange }: ReactionEntityValueProps) {
  const { fileName, href } = useFileNameHref(name, value);

  const handleChange = useCallback(
    (file: File | null) => {
      if (file) {
        const fileParts = file.name.split('.');
        const extensionFromFile = fileParts.length > 1 ? fileParts.at(-1) : null;
        file.arrayBuffer().then(buffer => {
          const extensionFromBlob = mime.getExtension(file.type);
          const extension = extensionFromFile ?? extensionFromBlob ?? 'txt';
          const stringContent = Buffer.from(buffer).toString('base64');
          onChange([stringContent, extension]);
        });
      }
    },
    [onChange],
  );

  const handleRemoveFile = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <Input.Wrapper
      label="Data"
      className={inputWrapperClasses.inputWrapper}
    >
      {value.value ? (
        <Flex gap="xs">
          <a
            download={fileName}
            href={href}
          >
            {fileName}
          </a>
          <ActionIcon
            onClick={handleRemoveFile}
            variant="transparent"
            color="red"
          >
            <RemoveIcon />
          </ActionIcon>
        </Flex>
      ) : (
        <FileInput onChange={handleChange} />
      )}
    </Input.Wrapper>
  );
}

function ReactionEntityDataValue({ name, value, onChange }: Readonly<ReactionEntityValueProps>) {
  switch (value.type) {
    case AppDataType.Number:
      return (
        <NumberInput
          label="Data"
          value={value.value as number}
          onChange={onChange}
        />
      );
    case AppDataType.Url:
    case AppDataType.Text:
      return (
        <TextInput
          label="Data"
          value={value.value as string}
          onChange={onChange}
        />
      );
    case AppDataType.Upload:
      return (
        <ReactionEntityDataFile
          name={name}
          value={value}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
}

export function ReactionEntityData({ formMethods }: Readonly<ReactionEntityNodeProps<ReactionFormData>>) {
  const { getInputProps } = formMethods;
  const [dataValue, onChange] = useUncontrolled<AppData['data']>({
    ...getInputProps('data'),
  });
  const name = formMethods.getValues()['name'];

  const onTypeChange = useCallback(
    (type: AppDataType) => {
      onChange({
        type,
        value: '',
        format: null,
      });
    },
    [onChange],
  );

  const onValueChange = (newValue: ChangeType) => {
    if (Array.isArray(newValue)) {
      const [fileContent, fileExtension] = newValue;
      onChange({ type: dataValue.type, value: fileContent, format: fileExtension });
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
        label="Type"
      />
      <ReactionEntityDataValue
        name={name}
        onChange={onValueChange}
        value={dataValue}
      />
      {dataValue.type === AppDataType.Upload && (
        <TextInput
          value={dataValue.format || ''}
          label="Format"
          disabled
        />
      )}
    </>
  );
}
