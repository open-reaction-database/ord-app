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
import { TextInput } from '@mantine/core';
import { useField } from '@mantine/form';
import { useEffect } from 'react';
import { StructureDialog } from '@open-reaction-database/ui/ketcher';
import type { MoleculeEditorProps } from '@open-reaction-database/ui/reaction';

/** The editor's molecule editor: Ketcher, saving a molfile with the drawing's details. */
export function ComponentsKetcherEditor({
  opened,
  onClose,
  identifier,
  onSave,
}: Readonly<MoleculeEditorProps>) {
  const initialDetails = identifier?.details || 'Drawn with Ketcher';
  const { getInputProps, getValue, setValue } = useField({
    mode: 'controlled',
    initialValue: initialDetails,
  });

  useEffect(() => {
    setValue(initialDetails);
  }, [setValue, initialDetails]);

  return (
    <StructureDialog
      opened={opened}
      onClose={onClose}
      initial={identifier?.value ?? ''}
      format="molfile"
      onSave={value => onSave({ value, details: getValue() })}
    >
      <TextInput
        placeholder="Details"
        label="Details"
        {...getInputProps()}
      />
    </StructureDialog>
  );
}
