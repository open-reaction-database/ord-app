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
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { useState } from 'react';
import { useLocation, useSearchParams } from 'wouter';
import { useAsk } from '#api/hooks.ts';
import type { AskResponse } from '#api/types.ts';
import { ExampleQuestions } from '#ask/ExampleQuestions.tsx';
import { askPath, isTooLong, MAX_QUESTION } from '#ask/questions.ts';
import { ErrorNotice } from '#components/ErrorNotice.tsx';
import { ReactionResults } from '#components/ReactionResults.tsx';
import { ResultTable } from '#components/ResultTable.tsx';
import { ViewerPage } from '#components/ViewerPage.tsx';

interface AskFormProps {
  question: string;
  onAsk: (question: string) => void;
}

/** The question box, starting from the URL's question; its host keys it by that question. */
function AskForm({ question, onAsk }: Readonly<AskFormProps>) {
  const [draft, setDraft] = useState(question);
  const trimmed = draft.trim();
  const tooLong = isTooLong(trimmed);
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
        <ExampleQuestions
          onAsk={example => {
            setDraft(example);
            onAsk(example);
          }}
        />
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
            <Code block>{JSON.stringify(answer.query, null, 2)}</Code>
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
      navigate(askPath(text));
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
