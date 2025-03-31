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
import { Button, Drawer, Flex, Textarea, TextInput, Title } from '@mantine/core';
import classes from './enumerationSetup.module.scss';
import { GroupSelector } from 'features/groups/GroupSelector/GroupSelector.tsx';
import { useForm, yupResolver } from '@mantine/form';
import { ReactionEntityBlockTitle } from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityBlock/ReactionEntityBlock.tsx';
import { useSelector } from 'react-redux';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { ReactionPreview } from 'common/components/ReactionPreview/ReactionPreview.tsx';
import { VariablesMatching } from './VariablesMatching/VariablesMatching.tsx';
import type { EnumerationForm, EnumerationFormTransform, EnumerationSetupForm } from './enumerationSetup.types.ts';
import { TemplateFileSelector } from './TemplateFileSelector/TemplateFileSelector.tsx';
import { useCallback } from 'react';
import { enumerationSetupExistingDatasetSchema, enumerationSetupNewDatasetSchema } from './enumerationSetup.schema.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { startEnumeration } from 'store/entities/enumeration/enumeration.thunks.ts';
import type { SetupEnumeration } from 'store/entities/enumeration/enumeration.types.ts';

interface CreateDatasetFromEnumerationProps {
  datasetId?: number;
  templateId?: string;
  onClose: () => void;
}

export function EnumerationSetup({
  datasetId,
  templateId: initialTemplateId,
  onClose,
}: Readonly<CreateDatasetFromEnumerationProps>) {
  const dispatch = useAppDispatch();
  const handleSubmit = useCallback(
    (data: SetupEnumeration) => {
      dispatch(startEnumeration(data));
    },
    [dispatch],
  );
  const doesDatasetExist = !!datasetId;
  const schema = doesDatasetExist ? enumerationSetupExistingDatasetSchema : enumerationSetupNewDatasetSchema;
  const title = doesDatasetExist ? 'Enumerate into existing dataset' : 'Create Dataset from Reaction Enumeration';

  const form: EnumerationForm = useForm<EnumerationSetupForm, EnumerationFormTransform>({
    initialValues: {
      dataset: datasetId ?? {
        groupId: null,
        name: '',
        description: '',
      },
      templateId: initialTemplateId ?? '',
      csvFile: null,
      templateCSV: null,
      matching: [],
    },
    transformValues: ({ csvFile, dataset, ...values }: EnumerationSetupForm) =>
      ({
        ...values,
        dataset:
          typeof dataset === 'number'
            ? dataset
            : {
                ...dataset,
                groupId: parseInt(dataset.groupId ?? ''),
              },
      }) as SetupEnumeration,
    validate: yupResolver(schema),
  });

  const template = useSelector(selectReactionById(form.values.templateId));

  return (
    <Drawer
      opened
      onClose={onClose}
      position="right"
      title={title}
      classNames={{ content: classes.content, header: classes.header, title: classes.title, body: classes.body }}
    >
      <form
        className={classes.form}
        onSubmit={form.onSubmit(handleSubmit)}
      >
        <Flex
          direction="column"
          gap="md"
          className={classes.formControls}
        >
          {!doesDatasetExist && (
            <Flex
              direction="column"
              gap="sm"
              className={classes.container}
            >
              <div className={classes.twoItemsRow}>
                <GroupSelector {...form.getInputProps('dataset.groupId')} />
                <TextInput
                  label="Dataset Name"
                  placeholder="Dataset Name"
                  {...form.getInputProps('dataset.name')}
                />
              </div>
              <Textarea
                label="Description"
                placeholder="Description"
                {...form.getInputProps('dataset.description')}
              />
            </Flex>
          )}
          <TemplateFileSelector
            form={form}
            templateDisabled={!!initialTemplateId}
          />

          <ReactionEntityBlockTitle leftSection={<Title order={3}>Reaction</Title>} />
          {template && <ReactionPreview reaction={template} />}

          <VariablesMatching form={form} />
        </Flex>
        <Flex
          gap="sm"
          justify="flex-end"
          className={classes.actions}
        >
          <Button
            onClick={onClose}
            variant="default"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
          >
            Create
          </Button>
        </Flex>
      </form>
    </Drawer>
  );
}
