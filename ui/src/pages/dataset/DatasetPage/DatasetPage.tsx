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
import { Flex, Loader, Paper, Title } from '@mantine/core';
import { selectDatasetById } from 'store/datasets/datasets.selectors';
import { useAppDispatch } from 'store/useAppDispatch';
import { getDataset } from 'store/datasets/datasets.thunks';
import { ReactionList } from './ReactionList/ReactionList';
import { DataField } from '../../../common/components/DataField/DataField';
import { DownloadMenu } from './DownloadMenu/DownloadMenu';
import { UserField } from '../../../common/components/UserField/UserField';
import { formatDate } from '../../../common/utils';
import { generateMockReactions } from '../../../common/mocks/generateMockReactions';
import classes from './DatasetPage.module.scss';

const mockData = generateMockReactions(200);

export function DatasetPage() {
  const dispatch = useAppDispatch();
  const { datasetId } = useParams();
  const dataset = useSelector(selectDatasetById(datasetId as string));

  useEffect(() => {
    dispatch(getDataset(Number(datasetId)));
  }, [dispatch, datasetId]);

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
              <UserField
                username={
                  dataset.owner.first_name && dataset.owner.last_name
                    ? `${dataset.owner.first_name} ${dataset.owner.last_name}`
                    : dataset.owner.email
                }
              />
            </DataField>
            <DataField label="Dataset ID">{dataset.id}</DataField>
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
          <DownloadMenu datasetId={Number(datasetId)} />
        </div>
      </Paper>

      <Paper
        className={classes.titleContainer}
        radius="sm"
        p="lg"
      >
        <Title order={2}>Dataset Reactions</Title>
        <span className={classes.counter}>{mockData.length}</span>
      </Paper>

      <ReactionList reactions={mockData} />
    </div>
  );
}
