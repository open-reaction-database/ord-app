/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, it, expect, vi } from 'vitest';
import { renderInReactionView, emptyReactionData } from 'test/renderInReactionView.tsx';
import { VariablesMatching } from './VariablesMatching.tsx';
import type { EnumerationForm } from '../enumerationSetup.types.ts';

const form = {
  values: {
    templateId: 1,
    matching: [{ variable: 'reagent' }],
    templateCSV: { headers: ['col1', 'col2'] },
  },
  getInputProps: () => ({ value: '', onChange: vi.fn() }),
} as unknown as EnumerationForm;

describe('VariablesMatching', () => {
  it('renders a matching row per template variable when the template and headers are available', () => {
    const { getByText } = renderInReactionView(<VariablesMatching form={form} />, {
      reactionId: 1,
      reaction: emptyReactionData(),
    });
    expect(getByText('Matching')).toBeInTheDocument();
    expect(getByText('Template Fields')).toBeInTheDocument();
    expect(getByText('Uploaded File Fields')).toBeInTheDocument();
    expect(getByText('@reagent')).toBeInTheDocument();
  });
});
