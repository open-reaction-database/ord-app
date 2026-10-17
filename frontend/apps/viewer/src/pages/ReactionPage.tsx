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
  Flex,
  Loader,
  Paper,
  SegmentedControl,
  Stack,
  type SegmentedControlItem,
} from '@mantine/core';
import {
  ReactionContent,
  ReactionDetailsSidebar,
  ReactionHeader,
} from '@open-reaction-database/ui/reaction';
import type { Breadcrumbs } from '@open-reaction-database/ui/shell';
import { useState } from 'react';
import { isNotFound } from '#api/client.ts';
import { useDatasets, useReaction } from '#api/hooks.ts';
import type { ReactionRecord } from '#api/types.ts';
import { DownloadButton } from '#components/DownloadButton.tsx';
import { ErrorNotice } from '#components/ErrorNotice.tsx';
import { FullRecordButton } from '#components/FullRecordButton.tsx';
import { ViewerPage } from '#components/ViewerPage.tsx';
import { NotFoundPage } from '#pages/NotFoundPage.tsx';
import { ViewerReactionProvider } from '#reaction/ViewerReactionProvider.tsx';

type ViewMode = 'tabs' | 'list';

const VIEW_MODES: Array<SegmentedControlItem> = [
  { label: 'Tabs', value: 'tabs' },
  { label: 'List', value: 'list' },
];

function reactionPath(reactionId: string): string {
  return `/reactions/${encodeURIComponent(reactionId)}`;
}

/** Datasets, then the reaction's dataset by name once the list has loaded, then it. */
function useBreadcrumbs(reactionId: string, datasetId: string | null): Breadcrumbs {
  const datasets = useDatasets();
  const crumbs: Breadcrumbs = [{ title: 'Datasets', path: '/datasets' }];
  if (datasetId !== null) {
    const name = datasets.data?.find(dataset => dataset.dataset_id === datasetId)?.name;
    crumbs.push({
      title: name ?? datasetId,
      path: `/datasets/${encodeURIComponent(datasetId)}`,
    });
  }
  crumbs.push({ title: reactionId, path: reactionPath(reactionId) });
  return crumbs;
}

function ReactionView({ record }: Readonly<{ record: ReactionRecord }>) {
  const [viewMode, setViewMode] = useState<ViewMode>('tabs');
  const breadcrumbs = useBreadcrumbs(record.reaction_id, record.dataset_id);
  return (
    <ViewerPage breadcrumbs={breadcrumbs}>
      <ViewerReactionProvider record={record}>
        <Stack gap="sm">
          <ReactionHeader
            actions={
              <>
                <DownloadButton reactionIds={[record.reaction_id]} />
                <FullRecordButton record={record} />
              </>
            }
          />
          <Paper p="xs">
            <SegmentedControl
              value={viewMode}
              onChange={value => setViewMode(value as ViewMode)}
              data={VIEW_MODES}
            />
          </Paper>
          <Paper
            radius="md"
            p="lg"
          >
            <ReactionContent viewMode={viewMode} />
          </Paper>
          <ReactionDetailsSidebar />
        </Stack>
      </ViewerReactionProvider>
    </ViewerPage>
  );
}

/** One reaction, read-only, as the editor's reaction page shows it. */
export function ReactionPage({ reactionId }: Readonly<{ reactionId: string }>) {
  const reaction = useReaction(reactionId);
  if (isNotFound(reaction.error)) {
    return <NotFoundPage />;
  }
  if (reaction.isSuccess) {
    return <ReactionView record={reaction.data} />;
  }
  const breadcrumbs = [
    { title: 'Datasets', path: '/datasets' },
    { title: reactionId, path: reactionPath(reactionId) },
  ];
  return (
    <ViewerPage breadcrumbs={breadcrumbs}>
      {reaction.isError ? (
        <ErrorNotice error={reaction.error} />
      ) : (
        <Flex justify="center">
          <Loader size="xl" />
        </Flex>
      )}
    </ViewerPage>
  );
}
