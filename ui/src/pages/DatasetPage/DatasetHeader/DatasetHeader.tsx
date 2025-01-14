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
import classes from './datasetHeader.module.scss';
import { DataField } from '../../../common/components/DataField/DataField';
import { UserField } from '../../../common/components/UserField/UserField';
import { ActionIcon, Button, Flex, Paper, Title } from '@mantine/core';
import { CopyButton, type CopyButtonOptions } from './CopyButton/CopyButton';
import { downloadFile, formatDate } from '../../../common/utils';
import { DownloadMenu, type DownloadMenuOptions } from './DownloadMenu/DownloadMenu';
import { ChevronDownIcon, EditIcon } from 'common/icons';
import type { Dataset } from 'store/datasets/datasets.types';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { EditDataset } from './EditDataset/EditDataset';
import { useSelector } from 'react-redux';
import { selectIsDatasetOpened } from '../../../store/datasets/datasets.selectors';
import { setDatasetEditOpenedAction } from '../../../store/datasets/datasets.actions';
import { useAppDispatch } from '../../../store/useAppDispatch';

interface DatasetHeaderProps {
  dataset: Dataset;
}

const datasetDownloadOptions: DownloadMenuOptions[] = [
  { label: '.pb', format: 'binpb' },
  { label: '.pbtxt', format: 'txtpb' },
  { label: '.json', format: 'json' },
];

export function DatasetHeader({ dataset }: Readonly<DatasetHeaderProps>) {
  const [location] = useLocation();
  const dispatch = useAppDispatch();
  const isEditOpened = useSelector(selectIsDatasetOpened);

  const openEdit = useCallback(() => {
    dispatch(setDatasetEditOpenedAction(true));
  }, [dispatch]);

  const closeEdit = useCallback(() => {
    dispatch(setDatasetEditOpenedAction(false));
  }, [dispatch]);

  const copyToClipboardOptions: CopyButtonOptions[] = useMemo(
    () => [
      { label: 'Copy Dataset Link', value: `${window.location.origin}${location}` },
      { label: 'Copy Dataset ID', value: dataset.id.toString() },
    ],
    [dataset.id, location],
  );

  const handleDatasetDownload = useCallback(
    (format: string) => {
      const url = `/datasets/${dataset.id}/download?file_format=${format}`;
      downloadFile(url, `Dataset_${dataset.id}`);
    },
    [dataset.id],
  );

  return (
    <Paper
      className={classes.header}
      radius="sm"
      p="lg"
    >
      <div>
        <div className={classes.datasetInfo}>
          <DataField label="Group">{dataset.group}</DataField>
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
          gap="sm"
          align="baseline"
        >
          <Title
            className={classes.title}
            order={1}
          >
            {dataset.name}
          </Title>
          <ActionIcon
            variant="transparent"
            onClick={openEdit}
          >
            <EditIcon className={classes.editIcon} />
          </ActionIcon>
        </Flex>

        <div>{dataset.description}</div>
      </div>

      <div className={classes.buttonContainer}>
        <DownloadMenu
          options={datasetDownloadOptions}
          onClick={handleDatasetDownload}
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
