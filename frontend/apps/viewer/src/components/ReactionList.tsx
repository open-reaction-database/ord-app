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
import { Anchor, Flex, Loader, Stack, Text } from '@mantine/core';
import { ReactionCard } from '@open-reaction-database/ui/reaction';
import { Link } from 'wouter';
import { useReactions } from '#api/hooks.ts';
import type { ReactionRecord } from '#api/types.ts';
import { ErrorNotice } from '#components/ErrorNotice.tsx';
import { usePaging } from '#components/paging.tsx';
import { ViewerReactionProvider } from '#reaction/ViewerReactionProvider.tsx';

function CardTitle({ record }: Readonly<{ record: ReactionRecord }>) {
  return (
    <Stack gap={0}>
      <Anchor
        component={Link}
        href={`/reactions/${encodeURIComponent(record.reaction_id)}`}
        fw={600}
      >
        {record.reaction_id}
      </Anchor>
      {record.dataset_id && (
        <Text size="sm">
          in{' '}
          <Anchor
            component={Link}
            href={`/datasets/${encodeURIComponent(record.dataset_id)}`}
          >
            {record.dataset_id}
          </Anchor>
        </Text>
      )}
    </Stack>
  );
}

interface ReactionListProps {
  /** The reactions, in order; the same array between renders, at most 1,000. */
  reactionIds: ReadonlyArray<string>;
}

/**
 * The reactions as cards, a page at a time; each page is one request, since a page
 * holds at most 100, the backend's bound for one.
 */
export function ReactionList({ reactionIds }: Readonly<ReactionListProps>) {
  const { pageItems, controls } = usePaging(reactionIds, 'reactions');
  const records = useReactions(pageItems);
  if (reactionIds.length === 0) {
    return <Text>No reactions.</Text>;
  }
  return (
    <Stack gap="md">
      {controls}
      {records.isError ? (
        <ErrorNotice error={records.error} />
      ) : records.isPending ? (
        <Flex justify="center">
          <Loader />
        </Flex>
      ) : (
        records.data.map(record => (
          <ViewerReactionProvider
            key={record.reaction_id}
            record={record}
          >
            <ReactionCard
              title={<CardTitle record={record} />}
              actions={null}
            />
          </ViewerReactionProvider>
        ))
      )}
    </Stack>
  );
}
