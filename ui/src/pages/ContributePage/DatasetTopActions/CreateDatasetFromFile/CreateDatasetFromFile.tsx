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
import { FileInput, Select } from '@mantine/core';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectActiveGroupId, selectOrderedGroupsList } from 'store/groups/groups.selectors';
import { useForm, yupResolver } from '@mantine/form';
import { FormModal } from 'common/components/FormModal/FormModal';
import { type CreateDatasetFromFileFormValues, createDatasetFromFileSchema } from './createDatasetFromFile.schema';
import type { CreateDatasetFromFilePayload } from 'store/datasets/datasets.types';
import { createDatasetFromFile } from 'store/datasets/datasets.thunks';
import { useAppDispatch } from 'store/useAppDispatch';
import { selectIsDatasetCreating } from 'store/datasets/datasets.selectors';

interface CreateDatasetFromFileProps {
  onClose: () => void;
}

export function CreateDatasetFromFile({ onClose }: Readonly<CreateDatasetFromFileProps>) {
  const dispatch = useAppDispatch();
  const groupsList = useSelector(selectOrderedGroupsList);
  const activeGroupId = useSelector(selectActiveGroupId);
  const isDatasetCreating = useSelector(selectIsDatasetCreating);
  const data = useMemo(() => {
    return groupsList.map(group => ({ value: group.id.toString(), label: group.name }));
  }, [groupsList]);

  const form = useForm<
    CreateDatasetFromFileFormValues,
    (values: CreateDatasetFromFileFormValues) => CreateDatasetFromFilePayload
  >({
    mode: 'controlled',
    initialValues: {
      groupId: activeGroupId ? activeGroupId.toString() : '',
      file: '',
    },
    transformValues: values => ({
      groupId: parseInt(values.groupId),
      file: values.file as File,
    }),
    validate: yupResolver(createDatasetFromFileSchema),
  });

  const onSubmit = useCallback(
    (values: CreateDatasetFromFilePayload) => {
      dispatch(createDatasetFromFile(values));
    },
    [dispatch],
  );

  return (
    <FormModal
      onClose={onClose}
      onSubmit={form.onSubmit(onSubmit)}
      title="Create Dataset from File"
      submitTitle="Create Dataset"
      loading={isDatasetCreating}
    >
      <Select
        data={data}
        label="Group"
        searchable
        {...form.getInputProps('groupId')}
      />
      <FileInput
        label="Dataset file"
        accept=".binpb,.txtpb,application/json"
        description=".binpb, .txtpb, or .json"
        {...form.getInputProps('file')}
      />
    </FormModal>
  );
}
