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
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'wouter';
import { Flex, Loader } from '@mantine/core';
import { selectDatasetById } from 'store/datasets/datasets.selectors';
import { useAppDispatch } from 'store/useAppDispatch';
import { getDataset } from 'store/datasets/datasets.thunks';
import { ReactionList } from './ReactionList/ReactionList';
import classes from './datasetPage.module.scss';
import { DatasetHeader } from './DatasetHeader/DatasetHeader';
import { getReactionsList } from 'store/reactions/reactions.thunks';
import type { Breadcrumbs } from 'common/types/breadcrumbs';
import { PageContainer } from 'common/components/PageContainer/PageContainer';

export function DatasetPage() {
  const dispatch = useAppDispatch();
  const { datasetId } = useParams();
  const id = parseInt(datasetId as string);
  const dataset = useSelector(selectDatasetById(id));

  const breadcrumbs = useMemo((): Breadcrumbs => {
    return [
      { title: 'Datasets', path: '/' },
      { path: `/dataset/${id}`, title: dataset?.name ?? id },
    ];
  }, [dataset?.name, id]);

  useEffect(() => {
    dispatch(getDataset(id));
    dispatch(getReactionsList(id));
  }, [dispatch, id]);

  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      {!dataset ? (
        <Flex
          justify="center"
          align="center"
        >
          <Loader size="xl" />
        </Flex>
      ) : (
        <div className={classes.container}>
          <DatasetHeader dataset={dataset} />
          <ReactionList />
        </div>
      )}
    </PageContainer>
  );
}
