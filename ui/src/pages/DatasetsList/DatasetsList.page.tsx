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

export function DatasetsListPage() {
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
