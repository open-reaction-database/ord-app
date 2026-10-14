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
  Button,
  Checkbox,
  Group,
  NativeSelect,
  NumberInput,
  RangeSlider,
  Stack,
  TagsInput,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { clamp } from '@mantine/hooks';
import { StructureDialog } from '@open-reaction-database/ui/ketcher';
import { useState } from 'react';
import {
  EMPTY_FORM,
  MAX_LIMIT,
  type MatchMode,
  type NumberRange,
  type SearchForm,
  type StructureField,
  type StructureTarget,
} from '#search/form.ts';

const MODE_OPTIONS = [
  { label: 'Exact', value: 'exact' },
  { label: 'Similar', value: 'similar' },
  { label: 'Substructure', value: 'substructure' },
  { label: 'SMARTS', value: 'smarts' },
];

const TARGET_OPTIONS = [
  { label: 'Input', value: 'input' },
  { label: 'Product', value: 'output' },
];

// The number fields' bounds, which both the input and the search enforce.
const SIMILARITY_BOUNDS = { min: 0.05, max: 1 };
const LIMIT_BOUNDS = { min: 1, max: MAX_LIMIT };

interface StructureRowProps {
  index: number;
  structure: StructureField;
  onChange: (structure: StructureField) => void;
  onRemove: () => void;
}

function StructureRow({
  index,
  structure,
  onChange,
  onRemove,
}: Readonly<StructureRowProps>) {
  const [drawing, setDrawing] = useState(false);
  const name = `structure ${index + 1}`;
  return (
    <Stack gap={4}>
      <TextInput
        label={`Structure ${index + 1}`}
        placeholder={structure.mode === 'smarts' ? 'SMARTS' : 'SMILES'}
        value={structure.pattern}
        onChange={event =>
          onChange({ ...structure, pattern: event.currentTarget.value })
        }
      />
      <Group gap="xs">
        <NativeSelect
          aria-label={`Side for ${name}`}
          size="xs"
          data={TARGET_OPTIONS}
          value={structure.target}
          onChange={event =>
            onChange({
              ...structure,
              target: event.currentTarget.value as StructureTarget,
            })
          }
        />
        <NativeSelect
          aria-label={`Match for ${name}`}
          size="xs"
          data={MODE_OPTIONS}
          value={structure.mode}
          onChange={event =>
            onChange({ ...structure, mode: event.currentTarget.value as MatchMode })
          }
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
      </Group>
      <StructureDialog
        opened={drawing}
        onClose={() => setDrawing(false)}
        initial={structure.pattern}
        format={structure.mode === 'smarts' ? 'smarts' : 'smiles'}
        onSave={pattern => onChange({ ...structure, pattern })}
      />
    </Stack>
  );
}

function RangeField({
  label,
  value,
  onChange,
}: Readonly<{
  label: string;
  value: NumberRange;
  onChange: (value: NumberRange) => void;
}>) {
  return (
    <Stack gap={4}>
      <Text size="sm">
        {label}: {value[0]}% to {value[1]}%
      </Text>
      <RangeSlider
        min={0}
        max={100}
        minRange={0}
        value={value}
        onChange={onChange}
        label={null}
        thumbFromLabel={`${label}, at least`}
        thumbToLabel={`${label}, at most`}
      />
    </Stack>
  );
}

/** A structure with a key that stays with it when a row before it is removed. */
interface Row {
  key: number;
  structure: StructureField;
}

let rowCount = 0;

function newRow(structure: StructureField): Row {
  rowCount += 1;
  return { key: rowCount, structure };
}

function lines(text: string): Array<string> {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');
}

interface SearchFormPanelProps {
  initial: SearchForm;
  onSearch: (form: SearchForm) => void;
}

/** The search form: structures, reaction SMARTS, ranges, and IDs, joined by and. */
export function SearchFormPanel({ initial, onSearch }: Readonly<SearchFormPanelProps>) {
  // The structures and reaction SMARTS are held apart from the rest until Search: the
  // structures with their rows' keys, the SMARTS as text, so a line being typed survives.
  const [form, setForm] = useState(initial);
  const [rows, setRows] = useState(() => initial.structures.map(newRow));
  const [smartsText, setSmartsText] = useState(initial.reactionSmarts.join('\n'));
  const update = (patch: Partial<SearchForm>) =>
    setForm(current => ({ ...current, ...patch }));
  const setStructure = (key: number, structure: StructureField) =>
    setRows(current =>
      current.map(row => (row.key === key ? { key, structure } : row)),
    );
  const removeStructure = (key: number) =>
    setRows(current => current.filter(row => row.key !== key));
  // Stereochemistry is matched only by a pattern: a substructure, SMARTS, or reaction SMARTS.
  const matchesPatterns =
    rows.some(({ structure }) => ['substructure', 'smarts'].includes(structure.mode)) ||
    lines(smartsText).length > 0;
  // A number field clamps itself on blur, which Enter skips, so the search clamps too.
  const search = () =>
    onSearch({
      ...form,
      similarity: clamp(form.similarity, SIMILARITY_BOUNDS.min, SIMILARITY_BOUNDS.max),
      limit: clamp(form.limit, LIMIT_BOUNDS.min, LIMIT_BOUNDS.max),
      structures: rows.map(({ structure }) => structure),
      reactionSmarts: lines(smartsText),
    });
  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        search();
      }}
    >
      <Stack gap="md">
        {rows.map(({ key, structure }, index) => (
          <StructureRow
            key={key}
            index={index}
            structure={structure}
            onChange={changed => setStructure(key, changed)}
            onRemove={() => removeStructure(key)}
          />
        ))}
        <Button
          variant="default"
          onClick={() =>
            setRows(current => [
              ...current,
              newRow({ pattern: '', target: 'input', mode: 'exact' }),
            ])
          }
        >
          Add a structure
        </Button>
        <Checkbox
          label="Match stereochemistry"
          description="For substructures, SMARTS, and reaction SMARTS"
          disabled={!matchesPatterns}
          checked={form.useStereochemistry}
          onChange={event =>
            update({ useStereochemistry: event.currentTarget.checked })
          }
        />
        {rows.some(({ structure }) => structure.mode === 'similar') && (
          <NumberInput
            label="Similarity threshold"
            {...SIMILARITY_BOUNDS}
            step={0.05}
            decimalScale={2}
            value={form.similarity}
            onChange={value => update({ similarity: Number(value) || form.similarity })}
          />
        )}
        <Textarea
          label="Reaction SMARTS"
          description="One per line"
          autosize
          minRows={2}
          value={smartsText}
          onChange={event => setSmartsText(event.currentTarget.value)}
        />
        <RangeField
          label="Yield"
          value={form.yieldRange}
          onChange={yieldRange => update({ yieldRange })}
        />
        <RangeField
          label="Conversion"
          value={form.conversionRange}
          onChange={conversionRange => update({ conversionRange })}
        />
        <TagsInput
          label="Dataset IDs"
          value={form.datasetIds}
          onChange={datasetIds => update({ datasetIds })}
          splitChars={[',', ' ']}
        />
        <TagsInput
          label="DOIs"
          value={form.dois}
          onChange={dois => update({ dois })}
          splitChars={[',', ' ']}
        />
        <TagsInput
          label="Reaction IDs"
          value={form.reactionIds}
          onChange={reactionIds => update({ reactionIds })}
          splitChars={[',', ' ']}
        />
        <NumberInput
          label="Limit"
          {...LIMIT_BOUNDS}
          allowDecimal={false}
          value={form.limit}
          onChange={value => update({ limit: Number(value) || form.limit })}
        />
        <Group justify="space-between">
          <Button
            variant="subtle"
            onClick={() => {
              setForm(EMPTY_FORM);
              setRows([]);
              setSmartsText('');
            }}
          >
            Clear
          </Button>
          <Button type="submit">Search</Button>
        </Group>
      </Stack>
    </form>
  );
}
