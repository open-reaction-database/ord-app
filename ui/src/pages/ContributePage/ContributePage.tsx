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
import { GroupsSidebar } from './GroupsSidebar/GroupsSidebar';
import { DatasetTable } from './DatasetTable/DatasetTable';
import { selectActiveGroupId } from 'store/groups/groups.selectors';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useAppDispatch } from 'store/useAppDispatch';
import { getInitialDatasetsList } from 'store/datasets/datasets.thunks';
import { DatasetTopActions } from './DatasetTopActions/DatasetTopActions';
import { PageContainer } from 'common/components/PageContainer/PageContainer';

export function ContributePage() {
  const appDispatch = useAppDispatch();
  const activeGroupId = useSelector(selectActiveGroupId);

  useEffect(() => {
    appDispatch(getInitialDatasetsList(activeGroupId));
  }, [activeGroupId, appDispatch]);

  return (
    <PageContainer breadcrumbs={[{ title: 'Datasets', path: '/' }]}>
      <Flex
        direction="column"
        gap="sm"
      >
        <DatasetTopActions />
        <Flex
          gap="sm"
          align="flex-start"
        >
          <GroupsSidebar />
          <DatasetTable />
        </Flex>
      </Flex>
    </PageContainer>
  );
}
