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
import { Button, Group } from '@mantine/core';
import { ASK_EXAMPLES } from '#ask/questions.ts';

/** A button for each example question, which asks it. */
export function ExampleQuestions({
  onAsk,
}: Readonly<{ onAsk: (question: string) => void }>) {
  return (
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
          onClick={() => onAsk(example)}
        >
          {example}
        </Button>
      ))}
    </Group>
  );
}
