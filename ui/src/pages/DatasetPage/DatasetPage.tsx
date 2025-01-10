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
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'wouter';
import { Button, Flex, Loader, Paper, Title } from '@mantine/core';
import { selectDatasetById } from 'store/datasets/datasets.selectors';
import { useAppDispatch } from 'store/useAppDispatch';
import { getDataset } from 'store/datasets/datasets.thunks';
import { ReactionList } from './ReactionList/ReactionList';
import { DataField } from 'common/components/DataField/DataField';
import { DownloadMenu, type DownloadMenuOptions } from './DownloadMenu/DownloadMenu';
import { UserField } from 'common/components/UserField/UserField';
import { downloadFile, formatDate } from 'common/utils';
import { generateMockReactions } from 'common/mocks/generateMockReactions';
import { CopyButton, type CopyButtonOptions } from './CopyButton/CopyButton';
import { AddCircleIcon, ChevronDownIcon, EmptyIcon } from 'common/icons';
import classes from './DatasetPage.module.scss';

const mockData = generateMockReactions(200);

const datasetDownloadOptions: DownloadMenuOptions[] = [
  { label: '.pb', format: 'binpb' },
  { label: '.pbtxt', format: 'txtpb' },
  { label: '.json', format: 'json' },
];

export function DatasetPage() {
  const dispatch = useAppDispatch();
  const { datasetId } = useParams();
  const dataset = useSelector(selectDatasetById(datasetId as string));

  useEffect(() => {
    dispatch(getDataset(Number(datasetId)));
  }, [dispatch, datasetId]);

  const handleDatasetDownload = (format: string) => {
    const url = `/datasets/${datasetId}/download?file_format=${format}`;
    downloadFile(url, `Dataset_${datasetId}`);
  };

  const copyToClipboardOptions: CopyButtonOptions[] = [
    { label: 'Copy Dataset Link', value: window.location.href },
    { label: 'Copy Dataset ID', value: datasetId as string },
  ];

  const reactions = mockData;

  const hasReactions = reactions.length > 0;

  const username = dataset?.owner.name;

  return !dataset ? (
    <Flex
      justify="center"
      align="center"
    >
      <Loader size="xl" />
    </Flex>
  ) : (
    <div className={classes.container}>
      <Paper
        className={classes.header}
        radius="sm"
        p="lg"
      >
        <div>
          <div className={classes.datasetInfo}>
            <DataField label="Group">{dataset.group}</DataField>
            <DataField label="Dataset Owner">
              <UserField username={username} />
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
          <Title
            className={classes.title}
            order={1}
          >
            {dataset.name}
          </Title>
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
      </Paper>

      <Paper
        radius="sm"
        p="lg"
      >
        <div className={classes.titleSection}>
          <div className={classes.titleContainer}>
            <Title order={2}>Dataset Reactions</Title>
            <span className={classes.counter}>{reactions.length}</span>
          </div>

          <Button
            classNames={{ root: classes.button, section: classes.buttonSection }}
            leftSection={<AddCircleIcon />}
          >
            Reaction
          </Button>
        </div>

        {!hasReactions && (
          <Flex
            align="center"
            justify="center"
          >
            <Flex
              direction="column"
              align="center"
              gap="8"
            >
              <EmptyIcon />
              <div className={classes.emptyText}>There are no reactions in the dataset yet</div>
            </Flex>
          </Flex>
        )}
      </Paper>

      <ReactionList reactions={reactions} />
    </div>
  );
}
