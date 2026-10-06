/**
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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from '@mantine/form';
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { showNotification } from 'common/utils/showNotification.tsx';
import { TemplateFileSelector } from './TemplateFileSelector.tsx';
import type {
  EnumerationForm,
  EnumerationFormTransform,
  EnumerationSetupForm,
} from '../enumerationSetup.types.ts';

vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));
vi.mock('store/entities/reactions/reactions.selectors.ts', async importActual => ({
  ...((await importActual()) as Record<string, unknown>),
  // The selected template: its variables are what the CSV's columns are matched to.
  selectReactionById: () => () => ({
    name: 'Template',
    variables: {
      first: { name: 'smiles' },
      second: { name: 'yield' },
      third: { name: 'temperature' },
    },
  }),
}));

const forms: Array<EnumerationForm> = [];

function Harness() {
  const form = useForm<EnumerationSetupForm, EnumerationFormTransform>({
    initialValues: {
      templateId: 'template-1',
      csvFile: null,
      templateCSV: null,
      matching: [],
    } as unknown as EnumerationSetupForm,
  });
  forms.push(form);
  return (
    <TemplateFileSelector
      form={form}
      templateDisabled={false}
    />
  );
}

async function uploadCsv(text: string) {
  const { container } = renderWithProviders(<Harness />);
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  await userEvent.upload(
    input,
    new File([text], 'variables.csv', { type: 'text/csv' }),
  );
}

const latestValues = () => forms[forms.length - 1].getValues();

beforeEach(() => {
  forms.length = 0;
  vi.clearAllMocks();
});

describe('TemplateFileSelector CSV upload', () => {
  it('parses headers and typed rows, and matches columns to template variables', async () => {
    await uploadCsv(
      'smiles,yield,notes\nCCO,40,"washed, ""twice"""\nCC(=O)O,12.5,TRUE\n',
    );

    await waitFor(() => expect(latestValues().templateCSV).toBeTruthy());
    expect(latestValues().templateCSV).toEqual({
      headers: ['smiles', 'yield', 'notes'],
      content: [
        { smiles: 'CCO', yield: 40, notes: 'washed, "twice"' },
        { smiles: 'CC(=O)O', yield: 12.5, notes: true },
      ],
    });
    expect(latestValues().matching).toEqual([
      { variable: 'smiles', csvColumn: 'smiles' },
      { variable: 'yield', csvColumn: 'yield' },
      { variable: 'temperature', csvColumn: null },
    ]);
  });

  it('reads semicolon-delimited files with CRLF line endings and blank cells', async () => {
    await uploadCsv('smiles;yield;ok\r\nCCO;;false\r\n');

    await waitFor(() => expect(latestValues().templateCSV).toBeTruthy());
    expect(latestValues().templateCSV).toEqual({
      headers: ['smiles', 'yield', 'ok'],
      content: [{ smiles: 'CCO', yield: '', ok: false }],
    });
  });

  it('rejects a file with duplicate column names', async () => {
    await uploadCsv('smiles,smiles\nCCO,CC\n');

    await waitFor(() => expect(showNotification).toHaveBeenCalled());
    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Duplicate column names are not allowed' }),
    );
    expect(latestValues().templateCSV).toBeNull();
    expect(latestValues().csvFile).toBeNull();
  });
});
