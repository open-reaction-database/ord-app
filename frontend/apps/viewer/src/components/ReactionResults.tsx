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
import { Alert, Button, Checkbox, Group, Stack, Title } from '@mantine/core';
import { Link } from 'wouter';
import type { ReactionsResult } from '#api/types.ts';
import { CopyLinkButton } from '#components/CopyLinkButton.tsx';
import { DownloadButton } from '#components/DownloadButton.tsx';
import { ReactionList } from '#components/ReactionList.tsx';
import { useSelection } from '#search/selection.ts';

/** A link to the selected reactions as a set, or a disabled button while there are none. */
function ViewSelected({ ids }: Readonly<{ ids: ReadonlyArray<string> }>) {
  const label = `View ${ids.length} selected`;
  if (ids.length === 0) {
    return <Button disabled>{label}</Button>;
  }
  return (
    <Button
      component={Link}
      href={`/reactions?${new URLSearchParams(ids.map(id => ['id', id]))}`}
    >
      {label}
    </Button>
  );
}

interface ReactionResultsProps {
  result: ReactionsResult;
  /** Names the selection kept for these results, such as the page's URL. */
  selectionKey: string;
  /** The most reactions the search asked for, when it set a limit of its own. */
  limit?: number;
}

/** Why there may be more reactions than these: the corpus's bound, or the search's limit. */
function StoppedNote({
  result,
  limit,
}: Readonly<{ result: ReactionsResult; limit?: number }>) {
  let note;
  if (result.truncated) {
    note = 'The search stopped at 1,000 reactions; narrow it to see the rest.';
  } else if (limit !== undefined && result.reaction_ids.length >= limit) {
    note = `The search stopped at its limit of ${limit.toLocaleString()}; raise the limit to see more.`;
  } else {
    return null;
  }
  return (
    <Alert
      color="yellow"
      variant="light"
    >
      {note}
    </Alert>
  );
}

/** A search's reactions: counted, selectable, downloadable, and listed. */
export function ReactionResults({
  result,
  selectionKey,
  limit,
}: Readonly<ReactionResultsProps>) {
  const selection = useSelection(selectionKey);
  const count = result.reaction_ids.length;
  return (
    <Stack gap="md">
      <Group
        justify="space-between"
        wrap="wrap"
      >
        <Title order={3}>
          {count.toLocaleString()} {count === 1 ? 'reaction' : 'reactions'}
        </Title>
        <Group gap="sm">
          <ViewSelected ids={selection.selected} />
          <Button
            variant="subtle"
            onClick={selection.clear}
            disabled={selection.selected.length === 0}
          >
            Clear selection
          </Button>
          <CopyLinkButton />
          <DownloadButton reactionIds={result.reaction_ids}>
            Download all
          </DownloadButton>
        </Group>
      </Group>
      <StoppedNote
        result={result}
        limit={limit}
      />
      <ReactionList
        reactionIds={result.reaction_ids}
        renderActions={record => {
          const id = record.reaction_id;
          const blocked = !selection.canSelect(id);
          return (
            <Checkbox
              aria-label={`Select ${id}`}
              title={blocked ? 'A set holds at most 100 reactions.' : undefined}
              checked={selection.isSelected(id)}
              disabled={blocked}
              onChange={() => selection.toggle(id)}
            />
          );
        }}
      />
    </Stack>
  );
}
