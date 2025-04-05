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
import { useFileNameHref } from 'common/components/inputs/FileControl/useFileNameHref.ts';
import { useCallback, type ReactNode } from 'react';
import mime from 'mime/lite';
import { Buffer } from 'buffer';
import { ActionIcon, FileInput, Flex, Input } from '@mantine/core';
import { inputWrapperClasses } from '../../display/InputWrapper';
import { RemoveIcon } from 'common/icons';
import type { FileControlValue } from './fileControl.types.ts';

interface FileControlProps {
  name: string;
  label: ReactNode;
  disabled?: boolean;
  value: FileControlValue | null;
  onChange: (value: FileControlValue | null) => void;
}

export function FileControl({ name, value, disabled, onChange, label }: Readonly<FileControlProps>) {
  const { fileName, href } = useFileNameHref(name, value);

  const handleChange = useCallback(
    (file: File | null) => {
      if (file) {
        const fileParts = file.name.split('.');
        const extensionFromFile = fileParts.length > 1 ? fileParts.at(-1) : null;
        file.arrayBuffer().then(buffer => {
          const formatFromBlob = mime.getExtension(file.type);
          const format = extensionFromFile ?? formatFromBlob ?? 'txt';
          const newValue = Buffer.from(buffer).toString('base64');
          onChange({ value: newValue, format });
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
      label={label}
      className={inputWrapperClasses.inputWrapper}
    >
      {value?.value ? (
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
            disabled={disabled}
          >
            <RemoveIcon />
          </ActionIcon>
        </Flex>
      ) : (
        <FileInput
          onChange={handleChange}
          disabled={disabled}
        />
      )}
    </Input.Wrapper>
  );
}
