/*
 * Copyright 2026 Open Reaction Database Project Authors
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
import {
  ActionIcon,
  Anchor,
  Code,
  Flex,
  Loader,
  Modal,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { useDatasets } from '#api/hooks.ts';
import type { DatasetSummary } from '#api/types.ts';
import { ErrorNotice } from '#components/ErrorNotice.tsx';
import { LinkedText } from '#components/LinkedText.tsx';
import { usePaging } from '#components/paging.tsx';
import { ViewerPage } from '#components/ViewerPage.tsx';
import { filterDatasets } from '#datasets/filterDatasets.ts';

function datasetPath(datasetId: string): string {
  return `/datasets/${encodeURIComponent(datasetId)}`;
}

/** The description, clamped to two lines, with a button that shows it whole. */
function Description({ dataset }: Readonly<{ dataset: DatasetSummary }>) {
  const [opened, setOpened] = useState(false);
  return (
    <Flex
      gap="xs"
      align="flex-start"
    >
      <Text
        size="sm"
        lineClamp={2}
      >
        <LinkedText text={dataset.description} />
      </Text>
      <ActionIcon
        variant="subtle"
        size="sm"
        aria-label="Show all of the description"
        onClick={() => setOpened(true)}
      >
        …
      </ActionIcon>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={dataset.name}
        size="lg"
      >
        <Stack gap="sm">
          <Code>{dataset.dataset_id}</Code>
          <Text size="sm">{dataset.reactions.toLocaleString()} reactions</Text>
          <Text>
            <LinkedText text={dataset.description} />
          </Text>
        </Stack>
      </Modal>
    </Flex>
  );
}

function DatasetTable({
  datasets,
}: Readonly<{ datasets: ReadonlyArray<DatasetSummary> }>) {
  const [filter, setFilter] = useState('');
  const shown = useMemo(() => filterDatasets(datasets, filter), [datasets, filter]);
  const { pageItems, controls } = usePaging(shown, 'datasets');
  return (
    <Stack gap="md">
      <TextInput
        label="Filter"
        placeholder="Words in a name, description, or ID"
        value={filter}
        onChange={event => setFilter(event.currentTarget.value)}
      />
      {controls}
      {/* On a phone the columns keep a readable width and scroll within the table. */}
      <Table.ScrollContainer minWidth={640}>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Reactions</Table.Th>
              <Table.Th>ID</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {pageItems.map(dataset => (
              <Table.Tr key={dataset.dataset_id}>
                <Table.Td>
                  <Anchor
                    component={Link}
                    href={datasetPath(dataset.dataset_id)}
                  >
                    {dataset.name}
                  </Anchor>
                </Table.Td>
                <Table.Td>
                  <Description dataset={dataset} />
                </Table.Td>
                <Table.Td>{dataset.reactions.toLocaleString()}</Table.Td>
                <Table.Td>
                  <Code>{dataset.dataset_id}</Code>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
}

/** Every dataset in the corpus, filtered and paged in the browser. */
export function DatasetsPage() {
  const datasets = useDatasets();
  let body;
  if (datasets.isError) {
    body = <ErrorNotice error={datasets.error} />;
  } else if (datasets.isPending) {
    body = (
      <Flex justify="center">
        <Loader />
      </Flex>
    );
  } else {
    body = <DatasetTable datasets={datasets.data} />;
  }
  return (
    <ViewerPage breadcrumbs={[{ title: 'Datasets', path: '/datasets' }]}>
      <Stack gap="md">
        <Title order={2}>Datasets</Title>
        {body}
      </Stack>
    </ViewerPage>
  );
}
