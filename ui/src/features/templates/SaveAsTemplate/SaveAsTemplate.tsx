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
import { useCallback } from 'react';
import { useForm, yupResolver } from '@mantine/form';
import { FormModal } from 'common/components/FormModal/FormModal.tsx';
import { type SaveAsTemplateSchemaFormValues, saveAsTemplateSchema } from './SaveAsTemplate.schema.ts';
import type { SaveAsTemplatePayload } from 'store/entities/templates/templates.types.ts';
import { createTemplate } from 'store/entities/templates/templates.thunks.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import type { ReactionId } from 'store/entities/reactions/reactions.types.ts';

interface SaveAsTemplateProps {
  reactionId: ReactionId;
  reactionPbId: string;
  onClose: () => void;
}

export function SaveAsTemplate({ onClose, reactionPbId, reactionId }: Readonly<SaveAsTemplateProps>) {
  const dispatch = useAppDispatch();

  const form = useForm<
    SaveAsTemplateSchemaFormValues,
    (values: SaveAsTemplateSchemaFormValues) => SaveAsTemplatePayload
  >({
    mode: 'controlled',
    initialValues: {
      reaction: reactionPbId,
      name: `${reactionPbId} Template`,
    },
    validate: yupResolver(saveAsTemplateSchema),
  });

  const onSubmit = useCallback(
    (values: SaveAsTemplateSchemaFormValues) => {
      dispatch(createTemplate({ reactionId: Number(reactionId), name: values.name }));
    },
    [dispatch, reactionId],
  );

  return (
    <FormModal
      onClose={onClose}
      onSubmit={form.onSubmit(onSubmit)}
      title="Create Template"
      submitTitle="Save"
    >
      <TextInput
        label="Create from reaction"
        disabled
        {...form.getInputProps('reaction')}
      />
      <TextInput
        label="Template name"
        {...form.getInputProps('name')}
      />
    </FormModal>
  );
}
