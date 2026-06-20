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
import { Flex } from '@mantine/core';
import { GroupsSidebar } from 'features/groups';
import { DatasetTable } from 'features/datasets';
import { PageContainer } from 'common/components/PageContainer/PageContainer.tsx';
import { DatasetsListTopActions } from './DatasetsListTopActions/DatasetsListTopActions.tsx';
import { EntitiesMenu } from 'features/templates/EntitiesMenu/EntitiesMenu.tsx';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { getInitialDatasetsList } from 'store/entities/datasets/datasets.thunks.ts';
import { selectActiveGroupId } from 'store/features/groups/groups.selectors.ts';

export function DatasetsListPage() {
  const dispatch = useAppDispatch();
  const activeGroupId = useSelector(selectActiveGroupId);
  // Refetch whenever the list view is shown (and on group switch) so a dataset removed by another
  // user — or after losing access — disappears on return instead of lingering stale. (#584)
  useEffect(() => {
    dispatch(getInitialDatasetsList(activeGroupId));
  }, [activeGroupId, dispatch]);

  return (
    <PageContainer breadcrumbs={[{ title: 'Datasets', path: '~/' }]}>
      <Flex
        direction="column"
        gap="sm"
      >
        <DatasetsListTopActions />
        <Flex
          gap="sm"
          align="flex-start"
        >
          <Flex
            direction="column"
            gap="sm"
            w={200}
          >
            <EntitiesMenu />
            <GroupsSidebar />
          </Flex>
          <DatasetTable />
        </Flex>
      </Flex>
    </PageContainer>
  );
}
