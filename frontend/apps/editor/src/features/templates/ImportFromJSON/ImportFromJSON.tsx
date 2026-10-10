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
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { FormModal } from 'common/components/FormModal/FormModal.tsx';
import { FileInput, TextInput } from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { selectTemplateFromFileError } from 'store/features/templateFromFileError/templateFromFileError.selectors.ts';
import { useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import type { ImportTemplatePayload } from 'store/entities/templates/templates.types.ts';
import { importFromFile } from 'store/entities/templates/templates.thunks.ts';
import { importFromJsonSchema } from './importFromJson.schema.ts';

interface ImportFromJSONProps {
  onClose: () => void;
}

type FormType = Pick<ImportTemplatePayload, 'name'> & { file: File | null };

export function ImportFromJSON({ onClose }: Readonly<ImportFromJSONProps>) {
  const dispatch = useAppDispatch();
  const error = useSelector(selectTemplateFromFileError);

  const onSubmit = useCallback(
    (values: FormType) => {
      dispatch(importFromFile(values as ImportTemplatePayload));
    },
    [dispatch],
  );

  const form = useForm<FormType>({
    initialValues: {
      name: '',
      file: null,
    },
    validateInputOnChange: true,
    validate: yupResolver(importFromJsonSchema),
  });

  const { setErrors } = form;

  useEffect(() => {
    if (error) {
      setErrors({ file: error });
    }
  }, [error, setErrors]);

  return (
    <FormModal
      onClose={onClose}
      title="Import from JSON"
      onSubmit={form.onSubmit(onSubmit)}
    >
      <TextInput
        label="Template Name"
        {...form.getInputProps('name')}
      />
      <FileInput
        label="Template JSON file"
        accept="application/json"
        {...form.getInputProps('file')}
      />
    </FormModal>
  );
}
