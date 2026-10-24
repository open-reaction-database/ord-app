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
import { Button, Code, Group, Stack, Text, TextInput } from '@mantine/core';
import { StructureDialog } from '@open-reaction-database/ui/ketcher';
import { useState } from 'react';
import type { Structures } from '#ask/questions.ts';

interface StructureFieldProps {
  name: string;
  structure: string;
  onChange: (structure: string) => void;
  onRemove: () => void;
}

/** One structure, by its placeholder: a field to type or paste it in, and a drawing. */
function StructureField({
  name,
  structure,
  onChange,
  onRemove,
}: Readonly<StructureFieldProps>) {
  const [drawing, setDrawing] = useState(false);
  return (
    <Group
      gap="xs"
      wrap="nowrap"
    >
      <Code>{name}</Code>
      <TextInput
        aria-label={`Structure ${name}`}
        placeholder="SMILES or SMARTS"
        flex={1}
        miw={0}
        value={structure}
        onChange={event => onChange(event.currentTarget.value)}
      />
      <Button
        size="xs"
        variant="default"
        aria-label={`Draw ${name}`}
        onClick={() => setDrawing(true)}
      >
        Draw
      </Button>
      <Button
        size="xs"
        variant="subtle"
        color="red"
        aria-label={`Remove ${name}`}
        onClick={onRemove}
      >
        Remove
      </Button>
      <StructureDialog
        opened={drawing}
        onClose={() => setDrawing(false)}
        initial={structure}
        format="smiles"
        onSave={onChange}
      />
    </Group>
  );
}

interface StructureFieldsProps {
  structures: Structures;
  /** Adds a structure; without it, the question holds as many as it may. */
  onAdd?: () => void;
  onChange: (name: string, structure: string) => void;
  onRemove: (name: string) => void;
}

/** A field for each structure a question names, and a way to add another. */
export function StructureFields({
  structures,
  onAdd,
  onChange,
  onRemove,
}: Readonly<StructureFieldsProps>) {
  const names = Object.keys(structures);
  return (
    <Stack gap="xs">
      {names.map(name => (
        <StructureField
          key={name}
          name={name}
          structure={structures[name]}
          onChange={structure => onChange(name, structure)}
          onRemove={() => onRemove(name)}
        />
      ))}
      <Group gap="xs">
        <Button
          size="xs"
          variant="default"
          disabled={onAdd === undefined}
          onClick={onAdd}
        >
          Add a structure
        </Button>
        {names.length > 0 && (
          <Text
            size="xs"
            c="dimmed"
          >
            Write each name, such as {names[0]}, where its structure goes in the
            question.
          </Text>
        )}
      </Group>
    </Stack>
  );
}
