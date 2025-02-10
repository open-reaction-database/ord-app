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
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'wouter';
import { Flex, Loader } from '@mantine/core';
import { selectDatasetById } from 'store/entities/datasets/datasets.selectors.ts';
import { ReactionList } from '../../features/reactions/ReactionList/ReactionList.tsx';
import { DatasetHeader } from '../../features/datasets/DatasetHeader/DatasetHeader.tsx';
import type { Breadcrumbs } from 'common/types/breadcrumbs.ts';
import { PageContainer } from 'common/components/PageContainer/PageContainer.tsx';
import classes from './dataset.page.module.scss';

export function DatasetPage() {
  const { datasetId } = useParams();
  const id = parseInt(datasetId as string);
  const dataset = useSelector(selectDatasetById(id));

  const breadcrumbs = useMemo((): Breadcrumbs => {
    return [
      { title: 'Datasets', path: '~/' },
      { path: `~/datasets/${id}`, title: dataset?.name ?? id },
    ];
  }, [dataset?.name, id]);

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
