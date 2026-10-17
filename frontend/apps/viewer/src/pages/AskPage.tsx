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
  Accordion,
  Button,
  Code,
  Flex,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { renderPreviews } from '@open-reaction-database/ui/reaction/previews';
import { useQuery } from '@tanstack/react-query';
import { useId, useState } from 'react';
import { useLocation, useSearchParams } from 'wouter';
import { useAsk } from '#api/hooks.ts';
import type { AskResponse, ResolvedCompound } from '#api/types.ts';
import { ErrorNotice } from '#components/ErrorNotice.tsx';
import { ReactionResults } from '#components/ReactionResults.tsx';
import { ResultTable } from '#components/ResultTable.tsx';
import { ViewerPage } from '#components/ViewerPage.tsx';

/** The backend's bound on a question's length in characters, after trimming. */
export const MAX_QUESTION = 2000;

/** ord-interface's examples. */
export const ASK_EXAMPLES = [
  'reactions for synthesizing ibuprofen',
  'reactions using benzene as an input with yield greater than 70%',
  'reactions that make an aryl boronic acid',
];

/** A standing note, not an alert, so it is not announced when the page loads. */
function DevelopmentNote() {
  return (
    <Paper
      p="sm"
      radius="md"
      bg="var(--mantine-color-yellow-light)"
    >
      <Text
        size="sm"
        c="var(--mantine-color-yellow-light-color)"
      >
        This feature is in development — results may be incomplete or change.
      </Text>
    </Paper>
  );
}

interface AskFormProps {
  question: string;
  onAsk: (question: string) => void;
}

/** The question box, starting from the URL's question; its host keys it by that question. */
function AskForm({ question, onAsk }: Readonly<AskFormProps>) {
  const [draft, setDraft] = useState(question);
  const trimmed = draft.trim();
  // By code point, as the backend counts, not by UTF-16 unit as length does.
  const tooLong = [...trimmed].length > MAX_QUESTION;
  return (
    <>
      <Textarea
        label="Question"
        placeholder="e.g. reactions using benzene as an input with yield greater than 70%"
        autosize
        minRows={2}
        value={draft}
        error={tooLong ? `At most ${MAX_QUESTION} characters.` : null}
        onChange={event => setDraft(event.currentTarget.value)}
      />
      <Group justify="space-between">
        <Group gap="xs">
          {ASK_EXAMPLES.map(example => (
            <Button
              key={example}
              variant="light"
              size="xs"
              // Mantine keeps a button's label on one line, which runs past a phone's edge.
              h="auto"
              py={6}
              styles={{ label: { whiteSpace: 'normal', textAlign: 'left' } }}
              onClick={() => {
                setDraft(example);
                onAsk(example);
              }}
            >
              {example}
            </Button>
          ))}
        </Group>
        <Button
          disabled={trimmed === '' || tooLong}
          onClick={() => onAsk(trimmed)}
        >
          Ask
        </Button>
      </Group>
    </>
  );
}

const STRUCTURE_SIZE = 120;

/** Leaves out what the backend writes for a field the query does not set: null or []. */
function unsetField(_key: string, value: unknown) {
  return value === null || (Array.isArray(value) && value.length === 0)
    ? undefined
    : value;
}

/** Each compound name in the query, drawn as the structure the search matched it as. */
function ResolvedCompounds({
  compounds,
}: Readonly<{ compounds: ReadonlyArray<ResolvedCompound> }>) {
  const labelId = useId();
  const images = useQuery({
    queryKey: [
      'resolved-structures',
      compounds.map(({ name, smiles }) => [name, smiles]),
    ],
    queryFn: () =>
      renderPreviews(
        Object.fromEntries(compounds.map(({ name, molblock }) => [name, molblock])),
        { size: STRUCTURE_SIZE },
      ),
  });
  return (
    <Stack gap="xs">
      <Text
        id={labelId}
        size="sm"
        fw={500}
      >
        Compounds it named
      </Text>
      <Group
        component="ul"
        aria-labelledby={labelId}
        gap="sm"
        align="flex-start"
        p={0}
        m={0}
        style={{ listStyle: 'none' }}
      >
        {compounds.map(({ name, smiles }) => {
          const image = images.data?.[name];
          return (
            <Paper
              key={name}
              component="li"
              p="xs"
              withBorder
              maw={STRUCTURE_SIZE + 40}
            >
              {image && (
                <img
                  src={`data:image/svg+xml;base64,${image}`}
                  alt={smiles}
                  width={STRUCTURE_SIZE}
                  height={STRUCTURE_SIZE}
                />
              )}
              <Text
                size="sm"
                fw={500}
                style={{ overflowWrap: 'anywhere' }}
              >
                {name}
              </Text>
              <Text
                size="xs"
                style={{ wordBreak: 'break-all' }}
              >
                {smiles}
              </Text>
            </Paper>
          );
        })}
      </Group>
    </Stack>
  );
}

function Answer({
  answer,
  selectionKey,
}: Readonly<{ answer: AskResponse; selectionKey: string }>) {
  return (
    <Stack gap="md">
      <Text>{answer.text}</Text>
      <Accordion variant="contained">
        <Accordion.Item value="query">
          <Accordion.Control>The query it ran</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Code block>{JSON.stringify(answer.query, unsetField, 2)}</Code>
              {answer.result.resolved.length > 0 && (
                <ResolvedCompounds compounds={answer.result.resolved} />
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      {answer.result.kind === 'reactions' ? (
        <ReactionResults
          result={answer.result}
          selectionKey={selectionKey}
          limit={answer.query.limit ?? undefined}
          moreHint="ask for more reactions to see the rest"
        />
      ) : (
        <ResultTable result={answer.result} />
      )}
    </Stack>
  );
}

/** Ask a question in English; the backend compiles it to a query and answers it. */
export function AskPage() {
  const [searchParams] = useSearchParams();
  const [, navigate] = useLocation();
  const question = (searchParams.get('q') ?? '').trim();
  const answer = useAsk(question === '' ? null : question);
  // The question already asked is asked again only after a failure; an answer is kept.
  const ask = (text: string) => {
    if (text !== question) {
      navigate(`/ask?${new URLSearchParams({ q: text })}`);
    } else if (answer.isError) {
      void answer.refetch();
    }
  };
  let body = null;
  if (question !== '') {
    if (answer.isError) {
      body = <ErrorNotice error={answer.error} />;
    } else if (answer.isPending) {
      body = (
        <Flex justify="center">
          <Loader />
        </Flex>
      );
    } else {
      body = (
        <Answer
          answer={answer.data}
          selectionKey={`ask:${question}`}
        />
      );
    }
  }
  return (
    <ViewerPage breadcrumbs={[{ title: 'Ask', path: '/ask' }]}>
      <Stack gap="md">
        <DevelopmentNote />
        <Title order={2}>Ask about reactions</Title>
        <AskForm
          key={question}
          question={question}
          onAsk={ask}
        />
        {body}
      </Stack>
    </ViewerPage>
  );
}
