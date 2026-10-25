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
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderAt } from '#test/render.tsx';
import {
  ASK_EXAMPLES,
  askPath,
  MAX_ADDRESS,
  MOST_STRUCTURES,
  type Structures,
} from '#ask/questions.ts';
import { QuestionForm } from '#ask/QuestionForm.tsx';

// Ketcher needs a canvas; this dialog saves benzene as soon as it opens, from what it
// was opened with.
const opened: Array<string> = [];
vi.mock('@open-reaction-database/ui/ketcher', () => ({
  StructureDialog: ({
    opened: isOpen,
    initial,
    onSave,
    onClose,
  }: Readonly<{
    opened: boolean;
    initial: string;
    onSave: (structure: string) => void;
    onClose: () => void;
  }>) =>
    isOpen ? (
      <button
        type="button"
        onClick={() => {
          opened.push(initial);
          onSave('c1ccccc1');
          onClose();
        }}
      >
        Save the drawing
      </button>
    ) : null,
}));

function show(question = '', structures: Structures = {}) {
  const onAsk = vi.fn((_question: string, _structures: Structures) => undefined);
  const result = renderAt(
    '/',
    <QuestionForm
      question={question}
      structures={structures}
      onAsk={onAsk}
    />,
  );
  return { ...result, onAsk };
}

describe('QuestionForm', () => {
  it('names each added structure in the question, and asks with what it holds', async () => {
    const user = userEvent.setup();
    const { getByRole, onAsk } = show();
    const question = getByRole('textbox', { name: 'Question' });
    await user.type(question, 'reactions that use');
    await user.click(getByRole('button', { name: 'Add a structure' }));
    expect(question).toHaveValue('reactions that use @A');
    expect(getByRole('button', { name: 'Ask' })).toBeDisabled();
    await user.type(getByRole('textbox', { name: 'Structure @A' }), ' CCO ');
    await user.click(getByRole('button', { name: 'Ask' }));
    expect(onAsk).toHaveBeenCalledWith('reactions that use @A', { '@A': 'CCO' });
  });

  it('draws a structure into its field, opening the drawing with what it holds', async () => {
    const user = userEvent.setup();
    opened.length = 0;
    const { getByRole } = show('reactions that make @A', { '@A': 'C1=CC=CC=C1' });
    await user.click(getByRole('button', { name: 'Draw @A' }));
    await user.click(getByRole('button', { name: 'Save the drawing' }));
    expect(opened).toEqual(['C1=CC=CC=C1']);
    expect(getByRole('textbox', { name: 'Structure @A' })).toHaveValue('c1ccccc1');
  });

  it('removes a structure and its name from the question', async () => {
    const user = userEvent.setup();
    const { getByRole, queryByRole, onAsk } = show('reactions that make @A from @B', {
      '@A': 'c1ccccc1',
      '@B': 'CCO',
    });
    await user.click(getByRole('button', { name: 'Remove @A' }));
    expect(queryByRole('textbox', { name: 'Structure @A' })).not.toBeInTheDocument();
    expect(getByRole('textbox', { name: 'Question' })).toHaveValue(
      'reactions that make from @B',
    );
    await user.click(getByRole('button', { name: 'Ask' }));
    expect(onAsk).toHaveBeenCalledWith('reactions that make from @B', { '@B': 'CCO' });
  });

  it('hands a removed name to the next structure added', async () => {
    const user = userEvent.setup();
    const { getByRole } = show('reactions with @A and @B', { '@A': 'C', '@B': 'N' });
    await user.click(getByRole('button', { name: 'Remove @A' }));
    await user.click(getByRole('button', { name: 'Add a structure' }));
    expect(getByRole('textbox', { name: 'Question' })).toHaveValue(
      'reactions with and @B @A',
    );
  });

  it('refuses a question whose address would be too long to reload', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText, onAsk } = show('reactions that make @A', {
      '@A': 'C'.repeat(
        MAX_ADDRESS - askPath('reactions that make @A', { '@A': '' }).length,
      ),
    });
    expect(getByRole('button', { name: 'Ask' })).toBeEnabled();
    await user.type(getByRole('textbox', { name: 'Structure @A' }), 'C');
    expect(
      getByText(
        'Too long to ask with its structures; shorten the question or a structure.',
      ),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: 'Ask' })).toBeDisabled();
    await user.type(getByRole('textbox', { name: 'Question' }), '{Enter}');
    expect(onAsk).not.toHaveBeenCalled();
  });

  it('adds no more structures than the backend takes', () => {
    const full = Object.fromEntries(
      Array.from({ length: MOST_STRUCTURES }, (_, index) => [
        `@${String.fromCodePoint(65 + index)}`,
        'C',
      ]),
    );
    const { getByRole } = show('reactions', full);
    expect(getByRole('button', { name: 'Add a structure' })).toBeDisabled();
  });

  it('asks an example with no structures', async () => {
    const user = userEvent.setup();
    const { getByRole, queryByRole, onAsk } = show('reactions that make @A', {
      '@A': 'c1ccccc1',
    });
    await user.click(getByRole('button', { name: ASK_EXAMPLES[2] }));
    expect(onAsk).toHaveBeenCalledWith(ASK_EXAMPLES[2], {});
    expect(queryByRole('textbox', { name: 'Structure @A' })).not.toBeInTheDocument();
  });

  it('links to the structured search', () => {
    const { getByRole } = show();
    expect(
      getByRole('link', { name: 'Or search by structure and conditions →' }),
    ).toHaveAttribute('href', '/search');
  });
});
