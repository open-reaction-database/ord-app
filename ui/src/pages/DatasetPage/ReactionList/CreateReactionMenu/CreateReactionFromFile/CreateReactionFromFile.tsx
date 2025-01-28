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
import { useCallback } from 'react';
import { FileInput } from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { FormModal } from 'common/components/FormModal/FormModal';
import { importReactionFromFile } from 'store/reactions/reactions.thunks';
import { useAppDispatch } from 'store/useAppDispatch';
import { type CreateReactionFromFileFormValues, createReactionFromFileSchema } from './createReactionFromFile.schema';
import { type ImportReactionFromFilePayload } from 'store/reactions/reactions.types';
import classes from './CreateReactionFromFile.module.scss';
import { setReactionUploadOpenedAction } from 'store/reactions/reactions.actions';

export function CreateReactionFromFile() {
  const dispatch = useAppDispatch();

  const form = useForm<
    CreateReactionFromFileFormValues,
    (values: CreateReactionFromFileFormValues) => ImportReactionFromFilePayload
  >({
    mode: 'controlled',
    transformValues: values => ({
      file: values.file as File,
    }),
    validate: yupResolver(createReactionFromFileSchema),
  });

  const onSubmit = useCallback(
    (values: ImportReactionFromFilePayload) => {
      dispatch(importReactionFromFile(values));
    },
    [dispatch],
  );

  const handleClose = useCallback(() => dispatch(setReactionUploadOpenedAction(false)), [dispatch]);

  return (
    <FormModal
      onClose={handleClose}
      onSubmit={form.onSubmit(onSubmit)}
      title="Import Reaction from File"
      submitTitle="Save"
    >
      <FileInput
        className={classes.fileInput}
        withAsterisk
        label="Reaction file"
        accept=".pb,.binpb,.txtpb,.pbtxt,application/json"
        description=".pb, .binpb, .txtpb, .pbtxt or .json"
        placeholder="Attach file"
        {...form.getInputProps('file')}
      />
    </FormModal>
  );
}
