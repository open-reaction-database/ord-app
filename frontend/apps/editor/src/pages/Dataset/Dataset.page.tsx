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
import { Flex, Loader } from '@mantine/core';
import classes from './dataset.page.module.scss';
import type { Breadcrumbs } from '@open-reaction-database/ui/shell';
import { selectDatasetById } from 'store/entities/datasets/datasets.selectors.ts';
import { ReactionList } from 'features/reactions/ReactionList/ReactionList.tsx';
import { DatasetHeader } from 'features/datasets/DatasetHeader/DatasetHeader.tsx';
import { EditorPageContainer } from 'common/components/PageContainer/EditorPageContainer.tsx';
import { getDataset } from 'store/entities/datasets/datasets.thunks.ts';
import { getReactionsList } from 'store/entities/reactions/reactions.thunks.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { NotFoundPage } from 'pages/NotFound/NotFoundPage';
import { resetErrorPageAction } from 'store/features/errorPage/errorPage.actions.ts';
import { selectErrorPage } from 'store/features/errorPage/errorPage.selectors.ts';

interface DatasetPageProps {
  datasetId: number;
}

export function DatasetPage({ datasetId: id }: Readonly<DatasetPageProps>) {
  const dispatch = useAppDispatch();
  const error = useSelector(selectErrorPage);
  const dataset = useSelector(selectDatasetById(id));

  useEffect(() => {
    dispatch(getDataset(id));
    dispatch(getReactionsList(id));
  }, [dispatch, id]);

  const breadcrumbs = useMemo((): Breadcrumbs => {
    return [
      { title: 'Datasets', path: '~/' },
      { path: `~/datasets/${id}`, title: dataset?.name ?? id },
    ];
  }, [dataset?.name, id]);

  useEffect(
    () => () => {
      dispatch(resetErrorPageAction());
    },
    [dispatch],
  );

  if (error) {
    return <NotFoundPage rejectValue={error} />;
  }

  return (
    <EditorPageContainer breadcrumbs={breadcrumbs}>
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
    </EditorPageContainer>
  );
}
