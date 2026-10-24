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
  Anchor,
  Button,
  Grid,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Link, useLocation } from 'wouter';
import { useDatasets, useNewestDataset } from '#api/hooks.ts';
import type { NewestDataset } from '#api/types.ts';
import { QuestionForm } from '#ask/QuestionForm.tsx';
import { askPath } from '#ask/questions.ts';
import { ErrorNotice } from '#components/ErrorNotice.tsx';
import { LinkedText } from '#components/LinkedText.tsx';
import { ViewerPage } from '#components/ViewerPage.tsx';

const COMPACT = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

// A day such as 2025-06-15 parses as midnight UTC, so it is shown in UTC: the
// viewer's own time zone would show the day before west of Greenwich.
const DAY = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

function Count({ value, label }: Readonly<{ value: number; label: string }>) {
  return (
    <div>
      <Text
        fz={28}
        fw={700}
        lh={1.2}
      >
        {COMPACT.format(value)}
      </Text>
      <Text
        size="sm"
        c="dimmed"
      >
        {label}
      </Text>
    </div>
  );
}

/** How many reactions and datasets the corpus holds, once the datasets have loaded. */
function Counts() {
  const datasets = useDatasets();
  if (datasets.isError) {
    return <ErrorNotice error={datasets.error} />;
  }
  if (datasets.isPending) {
    return (
      <Skeleton
        height={52}
        width={200}
      />
    );
  }
  const reactions = datasets.data.reduce((sum, dataset) => sum + dataset.reactions, 0);
  return (
    <Group gap="xl">
      <Count
        value={reactions}
        label="reactions"
      />
      <Count
        value={datasets.data.length}
        label="datasets"
      />
    </Group>
  );
}

function About() {
  return (
    <Stack gap="md">
      <Title order={1}>The Open Reaction Database</Title>
      <Text size="lg">
        An open-access schema and infrastructure for structuring and sharing organic
        reaction data, from benchtop reactions to automated high-throughput experiments
        and flow chemistry.
      </Text>
      <Counts />
      <Group gap="sm">
        <Button
          component={Link}
          href="/datasets"
        >
          Browse datasets
        </Button>
        <Button
          component={Link}
          href="/about"
          variant="outline"
        >
          Learn more
        </Button>
      </Group>
    </Stack>
  );
}

function NewestDatasetCard({ dataset }: Readonly<{ dataset: NewestDataset }>) {
  return (
    <Paper
      withBorder
      radius="md"
      p="lg"
    >
      <Stack gap="xs">
        <Text
          size="xs"
          fw={500}
          tt="uppercase"
          c="dimmed"
        >
          Recently added · {DAY.format(new Date(dataset.arrived))}
        </Text>
        <Title order={3}>{dataset.name}</Title>
        <Text
          size="sm"
          c="dimmed"
        >
          {dataset.reactions.toLocaleString()} reactions
        </Text>
        <Text
          size="sm"
          lineClamp={4}
        >
          <LinkedText text={dataset.description} />
        </Text>
        <Anchor
          component={Link}
          href={`/datasets/${encodeURIComponent(dataset.dataset_id)}`}
          size="sm"
        >
          View dataset →
        </Anchor>
      </Stack>
    </Paper>
  );
}

/** A question box that asks on the ask page. */
function AskBox() {
  const [, navigate] = useLocation();
  return (
    <Paper
      radius="md"
      p="lg"
      bg="var(--mantine-primary-color-light)"
    >
      <Stack gap="sm">
        <Title order={3}>Ask about reactions</Title>
        <QuestionForm
          question=""
          structures={{}}
          onAsk={(question, structures) => navigate(askPath(question, structures))}
        />
      </Stack>
    </Paper>
  );
}

/** The front page: what the ORD is, its newest dataset, and a question box. */
export function HomePage() {
  const newest = useNewestDataset();
  let card = null;
  if (newest.isError) {
    card = <ErrorNotice error={newest.error} />;
  } else if (newest.isPending) {
    card = (
      <Skeleton
        height={200}
        radius="md"
      />
    );
  } else if (newest.data !== null) {
    card = <NewestDatasetCard dataset={newest.data} />;
  }
  // The card sits beside the description from md up, with the question box below both;
  // on a narrower screen the question box, the page's main way in, comes before the card.
  return (
    <ViewerPage breadcrumbs={[]}>
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: card === null ? 12 : 7 }}>
          <About />
        </Grid.Col>
        {card !== null && (
          <Grid.Col
            span={{ base: 12, md: 5 }}
            order={{ base: 3, md: 2 }}
          >
            {card}
          </Grid.Col>
        )}
        <Grid.Col
          span={12}
          order={{ base: 2, md: 3 }}
        >
          <AskBox />
        </Grid.Col>
      </Grid>
    </ViewerPage>
  );
}
