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
import { DataField } from 'common/components/display/DataField/DataField.tsx';
import { UserField } from 'common/components/display/UserField/UserField.tsx';
import { ActionIcon, Button, Flex, Paper, Title } from '@mantine/core';
import { CopyButton, type CopyButtonOptions } from 'common/components/interactions/CopyButton/CopyButton.tsx';
import { formatDate } from 'common/utils';
import { DownloadMenu } from 'common/components/DownloadMenu/DownloadMenu.tsx';
import { ChevronDownIcon, EditIcon, RemoveIcon } from 'common/icons';
import type { Dataset } from 'store/entities/datasets/datasets.types.ts';
import { useCallback, useMemo } from 'react';
import { useLocation, useRouter } from 'wouter';
import { EditDataset } from './EditDataset/EditDataset.tsx';
import { useSelector } from 'react-redux';
import { selectIsDatasetOpened } from 'store/entities/datasets/datasets.selectors.ts';
import { setDatasetEditOpenedAction } from 'store/entities/datasets/datasets.actions.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { domain, fileDownloadOptions } from 'common/constants.ts';
import { ConfirmPopover } from 'common/components/interactions/ConfirmPopover/ConfirmPopover.tsx';
import { useDisclosure } from '@mantine/hooks';
import { removeDataset } from 'store/entities/datasets/datasets.thunks.ts';
import { GroupsListWithRoles } from 'common/components/GroupsListWithRoles/GroupsListWithRoles.tsx';
import classes from './datasetHeader.module.scss';
import { selectCanDatasetBeEdited } from 'store/features/canDatasetBeEdited/canDatasetBeEdited.selectors.ts';

interface DatasetHeaderProps {
  dataset: Dataset;
}

export function DatasetHeader({ dataset }: Readonly<DatasetHeaderProps>) {
  const [location] = useLocation();
  const { base } = useRouter();
  const dispatch = useAppDispatch();
  const isEditOpened = useSelector(selectIsDatasetOpened);
  const [removeConfirmOpened, { open: openRemoveConfirm, close: closeRemoveConfirm }] = useDisclosure(false);
  const canDatasetBeEdited = useSelector(selectCanDatasetBeEdited);

  const openEdit = useCallback(() => {
    dispatch(setDatasetEditOpenedAction(true));
  }, [dispatch]);

  const closeEdit = useCallback(() => {
    dispatch(setDatasetEditOpenedAction(false));
  }, [dispatch]);

  const copyToClipboardOptions: Array<CopyButtonOptions> = useMemo(
    () => [
      { label: 'Copy Dataset Link', value: `${domain}${base}${location}` },
      { label: 'Copy Dataset ID', value: dataset.id.toString() },
    ],
    [base, dataset.id, location],
  );

  const handleDatasetRemove = useCallback(() => {
    dispatch(removeDataset(dataset.id));
    closeRemoveConfirm();
  }, [dispatch, closeRemoveConfirm, dataset.id]);

  return (
    <Paper
      className={classes.header}
      radius="sm"
      p="lg"
    >
      <div>
        <div className={classes.datasetInfo}>
          <DataField label="Group">
            <GroupsListWithRoles data={dataset?.groups || []} />
          </DataField>
          <DataField label="Dataset Owner">
            <UserField username={dataset?.owner.name} />
          </DataField>
          <DataField label="Dataset ID">
            <Flex
              align="center"
              gap="4"
            >
              {dataset.id}
              <CopyButton options={copyToClipboardOptions} />
            </Flex>
          </DataField>
          <DataField label="Last Modified">{formatDate(dataset.modified_at)}</DataField>
        </div>
        <Flex
          className={classes.title}
          gap="sm"
          align="baseline"
        >
          {!dataset.name && (
            <Title
              className={classes.titlePlaceholder}
              order={1}
            >
              Dataset
            </Title>
          )}
          <Title order={1}>{dataset.name || dataset.id}</Title>
          {canDatasetBeEdited && (
            <ActionIcon
              variant="transparent"
              onClick={openEdit}
            >
              <EditIcon className={classes.editIcon} />
            </ActionIcon>
          )}
        </Flex>

        <div>{dataset.description}</div>
      </div>

      <div className={classes.buttonContainer}>
        {canDatasetBeEdited && (
          <ConfirmPopover
            opened={removeConfirmOpened}
            position="right"
            offset={8}
            title="Remove dataset"
            text="Are you sure to remove this dataset?"
            onConfirm={handleDatasetRemove}
            onCancel={closeRemoveConfirm}
            target={
              <Button
                classNames={{ section: classes.removeIcon }}
                variant="transparent"
                color="red"
                leftSection={<RemoveIcon />}
                onClick={openRemoveConfirm}
              >
                Remove
              </Button>
            }
          />
        )}
        <DownloadMenu
          options={fileDownloadOptions}
          url={`/datasets/${dataset.id}/download`}
          target={
            <Button
              className={classes.target}
              rightSection={<ChevronDownIcon />}
              title="Download dataset"
            >
              Download as
            </Button>
          }
        />
      </div>
      {isEditOpened && (
        <EditDataset
          datasetId={dataset.id}
          onClose={closeEdit}
        />
      )}
    </Paper>
  );
}
