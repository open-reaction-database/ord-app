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
import { Select, Textarea, TextInput } from '@mantine/core';
import { useSelector } from 'react-redux';
import { selectOrderedGroupsList } from 'store/entities/groups/groups.selectors.ts';
import { useCallback, useMemo } from 'react';
import { useForm, yupResolver } from '@mantine/form';
import { type CreateNewDatasetFormValues, createNewDatasetSchema } from './createNewDataset.schema.ts';
import type { CreateNewDatasetPayload } from 'store/entities/datasets/datasets.types.ts';
import { createEmptyDataset } from 'store/entities/datasets/datasets.thunks.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { selectIsDatasetCreating } from 'store/entities/datasets/datasets.selectors.ts';
import { FormModal } from 'common/components/FormModal/FormModal.tsx';
import { selectActiveGroupId } from 'store/features/groups/groups.selectors.ts';

interface CreateNewDatasetProps {
  onClose: () => void;
}

export function CreateNewDataset({ onClose }: Readonly<CreateNewDatasetProps>) {
  const dispatch = useAppDispatch();
  const groupsList = useSelector(selectOrderedGroupsList);
  const activeGroupId = useSelector(selectActiveGroupId);
  const isLoading = useSelector(selectIsDatasetCreating);

  const form = useForm<CreateNewDatasetFormValues, (values: CreateNewDatasetFormValues) => CreateNewDatasetPayload>({
    mode: 'controlled',
    initialValues: {
      groupId: activeGroupId ? activeGroupId.toString() : '',
      name: '',
      description: '',
    },
    validateInputOnChange: true,
    validate: yupResolver(createNewDatasetSchema),
    transformValues: (values: CreateNewDatasetFormValues): CreateNewDatasetPayload => ({
      groupId: parseInt(values.groupId),
      name: values.name,
      description: values.description,
    }),
  });

  const data = useMemo(() => {
    return groupsList.map(group => ({ value: group.id.toString(), label: group.name }));
  }, [groupsList]);

  const onSubmit = useCallback(
    (values: CreateNewDatasetPayload) => {
      dispatch(createEmptyDataset(values));
    },
    [dispatch],
  );

  return (
    <FormModal
      onClose={onClose}
      onSubmit={form.onSubmit(onSubmit)}
      title="Create Dataset from Scratch"
      submitTitle="Create Dataset"
    >
      <Select
        data={data}
        label="Group"
        searchable
        disabled={isLoading}
        {...form.getInputProps('groupId')}
        required
      />
      <TextInput
        label="Dataset Name"
        disabled={isLoading}
        {...form.getInputProps('name')}
      />
      <Textarea
        label="Description"
        disabled={isLoading}
        {...form.getInputProps('description')}
      />
    </FormModal>
  );
}
