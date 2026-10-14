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
  Code,
  Flex,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import type { UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';
import { isNotFound } from '#api/client.ts';
import { useDataset, useSearch } from '#api/hooks.ts';
import type { DatasetSummary, Query, SearchResult } from '#api/types.ts';
import { CompoundChart } from '#components/CompoundChart.tsx';
import { CopyLinkButton } from '#components/CopyLinkButton.tsx';
import { DownloadButton } from '#components/DownloadButton.tsx';
import { ErrorNotice } from '#components/ErrorNotice.tsx';
import { LinkedText } from '#components/LinkedText.tsx';
import { ReactionList } from '#components/ReactionList.tsx';
import { ViewerPage } from '#components/ViewerPage.tsx';
import { NotFoundPage } from '#pages/NotFoundPage.tsx';

/** The most reactions a dataset's page shows: one request's worth. */
export const DATASET_SAMPLE = 100;

// One array for every empty answer, so a list paged over it keeps its page.
const NO_IDS: ReadonlyArray<string> = [];

interface SampleProps {
  dataset: DatasetSummary;
  sample: UseQueryResult<SearchResult>;
}

function Sample({ dataset, sample }: Readonly<SampleProps>) {
  if (sample.isError) {
    return <ErrorNotice error={sample.error} />;
  }
  if (sample.isPending) {
    return (
      <Flex justify="center">
        <Loader />
      </Flex>
    );
  }
  const ids = sample.data.kind === 'reactions' ? sample.data.reaction_ids : NO_IDS;
  const title =
    dataset.reactions > ids.length
      ? `${ids.length} reactions from this dataset (a sample)`
      : `Reactions in this dataset (${ids.length})`;
  return (
    <Stack gap="md">
      <Group
        justify="space-between"
        wrap="wrap"
      >
        <Title order={3}>{title}</Title>
        <Group gap="sm">
          <CopyLinkButton />
          <DownloadButton reactionIds={ids}>Download all</DownloadButton>
        </Group>
      </Group>
      <ReactionList reactionIds={ids} />
    </Stack>
  );
}

/** A dataset: what it is, what it is made of, and a sample of its reactions. */
export function DatasetPage({ datasetId }: Readonly<{ datasetId: string }>) {
  const dataset = useDataset(datasetId);
  const query = useMemo(
    (): Query => ({
      where: { op: 'eq', path: 'dataset_id', value: { literal: datasetId } },
      order_by: [{ key: 'reaction_id' }],
      limit: DATASET_SAMPLE,
    }),
    [datasetId],
  );
  const sample = useSearch(dataset.isSuccess ? query : null);
  if (isNotFound(dataset.error)) {
    return <NotFoundPage />;
  }
  const breadcrumbs = [
    { title: 'Datasets', path: '/' },
    {
      title: dataset.data?.name ?? datasetId,
      path: `/datasets/${encodeURIComponent(datasetId)}`,
    },
  ];
  let body;
  if (dataset.isError) {
    body = <ErrorNotice error={dataset.error} />;
  } else if (dataset.isPending) {
    body = (
      <Flex justify="center">
        <Loader />
      </Flex>
    );
  } else {
    body = (
      <Stack gap="lg">
        <Stack gap="xs">
          <Title order={2}>{dataset.data.name}</Title>
          <Code>{dataset.data.dataset_id}</Code>
          <Text>
            <LinkedText text={dataset.data.description} />
          </Text>
          <Text size="sm">{dataset.data.reactions.toLocaleString()} reactions</Text>
        </Stack>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <CompoundChart
            datasetId={datasetId}
            side="inputs"
            title="Most frequent inputs"
          />
          <CompoundChart
            datasetId={datasetId}
            side="products"
            title="Most frequent products"
          />
        </SimpleGrid>
        <Sample
          dataset={dataset.data}
          sample={sample}
        />
      </Stack>
    );
  }
  return <ViewerPage breadcrumbs={breadcrumbs}>{body}</ViewerPage>;
}
