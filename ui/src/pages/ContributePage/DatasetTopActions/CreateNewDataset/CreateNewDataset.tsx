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
import { Button, Flex, Modal, Select, Textarea, TextInput } from '@mantine/core';
import { useSelector } from 'react-redux';
import { selectActiveGroupId, selectOrderedGroupsList } from 'store/groups/groups.selectors';
import { useCallback, useMemo } from 'react';
import { useForm, yupResolver } from '@mantine/form';
import { type CreateNewDatasetFormValues, createNewDatasetSchema } from './createNewDataset.schema';
import type { CreateEmptyDataset } from 'store/datasets/datasets.types';
import { createEmptyDataset } from 'store/datasets/datasets.thunks';
import { useAppDispatch } from 'store/useAppDispatch';
import { selectIsDatasetCreating } from 'store/datasets/datasets.selectors';

interface CreateNewDatasetProps {
  onClose: () => void;
}

export function CreateNewDataset({ onClose }: Readonly<CreateNewDatasetProps>) {
  const dispatch = useAppDispatch();
  const groupsList = useSelector(selectOrderedGroupsList);
  const activeGroupId = useSelector(selectActiveGroupId);
  const isLoading = useSelector(selectIsDatasetCreating);

  const form = useForm<CreateNewDatasetFormValues, (values: CreateNewDatasetFormValues) => CreateEmptyDataset>({
    mode: 'controlled',
    initialValues: {
      groupId: activeGroupId ? activeGroupId.toString() : '',
      name: '',
      description: '',
    },
    validateInputOnChange: true,
    validate: yupResolver(createNewDatasetSchema),
    transformValues: (values: CreateNewDatasetFormValues): CreateEmptyDataset => ({
      groupId: parseInt(values.groupId),
      name: values.name,
      description: values.description,
    })
  });

  const data = useMemo(() => {
    return groupsList.map(group => ({ value: group.id.toString(), label: group.name }))
  }, [groupsList]);

  const onSubmit = useCallback((values: CreateEmptyDataset) => {
    dispatch(createEmptyDataset(values));
  }, [dispatch]);

  return (
    <Modal opened onClose={onClose} centered title="Create Dataset from Scratch">
      <form onSubmit={form.onSubmit(onSubmit)}>
      <Flex direction="column" gap="sm">
       <Select data={data} label="Group" searchable disabled={isLoading} {...form.getInputProps('groupId')} required />
        <TextInput label="Dataset Name" disabled={isLoading} {...form.getInputProps('name')} />
        <Textarea label="Description" disabled={isLoading} {...form.getInputProps('description')} />
        <Flex justify="flex-end" align="center" gap="md">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isLoading} >Create Dataset</Button>
        </Flex>
      </Flex>
      </form>
    </Modal>
  )

}