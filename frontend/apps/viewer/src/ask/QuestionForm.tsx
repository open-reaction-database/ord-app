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
import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useState } from 'react';
import { ExampleQuestions } from '#ask/ExampleQuestions.tsx';
import {
  askPath,
  isTooLong,
  MAX_ADDRESS,
  MAX_QUESTION,
  nextPlaceholder,
  type Structures,
  withoutPlaceholder,
  withPlaceholder,
} from '#ask/questions.ts';
import { StructureFields } from '#ask/StructureFields.tsx';

interface QuestionFormProps {
  question: string;
  structures: Structures;
  onAsk: (question: string, structures: Structures) => void;
}

/**
 * The question box, with the structures it names and the example questions.
 *
 * It starts from `question` and `structures` and keeps its own draft after; its host
 * keys it by them to start again.
 */
export function QuestionForm({
  question,
  structures: initialStructures,
  onAsk,
}: Readonly<QuestionFormProps>) {
  const [draft, setDraft] = useState(question);
  const [structures, setStructures] = useState(initialStructures);
  const trimmed = draft.trim();
  const tooLong = isTooLong(trimmed);
  const drawn = Object.fromEntries(
    Object.entries(structures).map(([name, structure]) => [name, structure.trim()]),
  );
  const unfinished = Object.values(drawn).includes('');
  const unaddressable = askPath(trimmed, drawn).length > MAX_ADDRESS;
  let error = null;
  if (tooLong) {
    error = `At most ${MAX_QUESTION} characters.`;
  } else if (unaddressable) {
    error = 'Too long to ask with its structures; shorten the question or a structure.';
  }
  const next = nextPlaceholder(structures);
  const add = (name: string) => {
    setStructures({ ...structures, [name]: '' });
    setDraft(withPlaceholder(draft, name));
  };
  const remove = (name: string) => {
    setStructures(
      Object.fromEntries(Object.entries(structures).filter(([held]) => held !== name)),
    );
    setDraft(withoutPlaceholder(draft, name));
  };
  return (
    // Enter submits only while Ask is enabled, so a submitted question is never empty,
    // too long for the backend or an address, or naming a structure with nothing in its
    // field.
    <form
      onSubmit={event => {
        event.preventDefault();
        onAsk(trimmed, drawn);
      }}
    >
      <Stack gap="sm">
        <Group
          gap="xs"
          align="flex-start"
          wrap="nowrap"
        >
          <TextInput
            aria-label="Question"
            placeholder="e.g. reactions that make an aryl boronic acid"
            flex={1}
            value={draft}
            error={error}
            onChange={event => setDraft(event.currentTarget.value)}
          />
          <Button
            type="submit"
            disabled={trimmed === '' || error !== null || unfinished}
          >
            Ask
          </Button>
        </Group>
        <StructureFields
          structures={structures}
          onAdd={next === undefined ? undefined : () => add(next)}
          onChange={(name, structure) =>
            setStructures({ ...structures, [name]: structure })
          }
          onRemove={remove}
        />
        <ExampleQuestions
          onAsk={example => {
            setDraft(example);
            setStructures({});
            onAsk(example, {});
          }}
        />
      </Stack>
    </form>
  );
}
