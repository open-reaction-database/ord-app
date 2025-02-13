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
import { Button, Flex, Modal, Textarea, TextInput } from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { useSelector } from 'react-redux';
import { selectDatasetById } from 'store/entities/datasets/datasets.selectors.ts';
import { type EditDatasetFormValues, editDatasetSchema } from './editDataset.schema.ts';
import { useCallback } from 'react';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { updateDataset } from 'store/entities/datasets/datasets.thunks.ts';

interface EditDatasetProps {
  datasetId: number;
  onClose: () => void;
}

export function EditDataset({ datasetId, onClose }: Readonly<EditDatasetProps>) {
  const dispatch = useAppDispatch();
  const dataset = useSelector(selectDatasetById(datasetId));

  const form = useForm({
    mode: 'controlled',
    initialValues: {
      name: dataset.name || '',
      description: dataset.description || '',
    },
    validate: yupResolver(editDatasetSchema),
  });

  const onSubmit = useCallback(
    (values: EditDatasetFormValues) => {
      dispatch(updateDataset({ id: datasetId, ...values }));
    },
    [dispatch, datasetId],
  );

  return (
    <Modal
      opened
      title="Edit Dataset"
      onClose={onClose}
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Flex
          direction="column"
          gap="md"
        >
          <TextInput
            label="Name"
            {...form.getInputProps('name')}
          />
          <Textarea
            label="Description"
            {...form.getInputProps('description')}
          />

          <Flex
            gap="md"
            justify="flex-end"
          >
            <Button
              variant="default"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </Flex>
        </Flex>
      </form>
    </Modal>
  );
}
