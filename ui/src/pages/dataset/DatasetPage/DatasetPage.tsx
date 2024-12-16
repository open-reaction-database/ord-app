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

  if (!dataset) {
    return (
      <Flex
        justify="center"
        align="center"
      >
        <Loader size="xl" />
      </Flex>
    );
  }

  const { id, group, owner, name, description, modified_at } = dataset;

  return (
    <div className={classes.container}>
      <Paper
        radius="sm"
        p="lg"
      >
        <div className={classes.datasetInfo}>
          <DataField label="Group">{group}</DataField>
          <DataField label="Dataset Owner">
            <UserField
              username={owner.first_name && owner.last_name ? `${owner.first_name} ${owner.last_name}` : owner.email}
            />
          </DataField>
          <DataField label="Dataset ID">{id}</DataField>
          <DataField label="Last Modified">{formatDate(modified_at)}</DataField>
        </div>
        <Title
          className={classes.title}
          order={1}
        >
          {name}
        </Title>
        <div>{description}</div>
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
