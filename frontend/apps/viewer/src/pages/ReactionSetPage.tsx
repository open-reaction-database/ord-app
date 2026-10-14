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
import { Alert, Group, Stack, Title } from '@mantine/core';
import { useMemo } from 'react';
import { useSearchParams } from 'wouter';
import { REACTIONS_PER_REQUEST } from '#api/hooks.ts';
import { CopyLinkButton } from '#components/CopyLinkButton.tsx';
import { DownloadButton } from '#components/DownloadButton.tsx';
import { ReactionList } from '#components/ReactionList.tsx';
import { ViewerPage } from '#components/ViewerPage.tsx';
import { selectedIds } from '#reaction/selectedIds.ts';

/** Reactions chosen by ID, as a search's selection or a shared link names them. */
export function ReactionSetPage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.toString();
  const { ids, dropped } = useMemo(
    () => selectedIds(new URLSearchParams(search)),
    [search],
  );
  const path = search ? `/reactions?${search}` : '/reactions';
  return (
    <ViewerPage breadcrumbs={[{ title: 'Selected reactions', path }]}>
      <Stack gap="md">
        <Group
          justify="space-between"
          wrap="wrap"
        >
          <Title order={2}>Selected reactions</Title>
          <Group gap="sm">
            <CopyLinkButton />
            <DownloadButton reactionIds={ids}>Download all</DownloadButton>
          </Group>
        </Group>
        {dropped > 0 && (
          <Alert
            color="yellow"
            variant="light"
          >
            A set holds at most {REACTIONS_PER_REQUEST} reactions; the other {dropped}{' '}
            are left out.
          </Alert>
        )}
        <ReactionList reactionIds={ids} />
      </Stack>
    </ViewerPage>
  );
}
