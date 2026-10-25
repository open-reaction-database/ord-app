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
import { Accordion, Code, Flex, Loader, Stack, Text, Title } from '@mantine/core';
import { useLocation, useSearchParams } from 'wouter';
import { useAsk } from '#api/hooks.ts';
import type { AskResponse } from '#api/types.ts';
import { DevelopmentNote } from '#ask/DevelopmentNote.tsx';
import { QuestionForm } from '#ask/QuestionForm.tsx';
import { askPath, readStructures, type Structures } from '#ask/questions.ts';
import { ErrorNotice } from '#components/ErrorNotice.tsx';
import { ReactionResults } from '#components/ReactionResults.tsx';
import { ResultTable } from '#components/ResultTable.tsx';
import { ViewerPage } from '#components/ViewerPage.tsx';

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
  const structures = readStructures(searchParams);
  const asked = askPath(question, structures);
  const answer = useAsk(question === '' ? null : question, structures);
  // The question already asked is asked again only after a failure; an answer is kept.
  const ask = (text: string, drawn: Structures) => {
    const path = askPath(text, drawn);
    if (path !== asked) {
      navigate(path);
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
          selectionKey={`ask:${asked}`}
        />
      );
    }
  }
  return (
    <ViewerPage breadcrumbs={[{ title: 'Ask', path: '/ask' }]}>
      <Stack gap="md">
        <DevelopmentNote />
        <Title order={2}>Ask about reactions</Title>
        <QuestionForm
          key={asked}
          question={question}
          structures={structures}
          onAsk={ask}
        />
        {body}
      </Stack>
    </ViewerPage>
  );
}
