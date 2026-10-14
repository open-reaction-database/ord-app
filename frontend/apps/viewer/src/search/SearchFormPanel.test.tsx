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
import { fireEvent } from '@testing-library/react';
import { renderAt } from '#test/render.tsx';
import { EMPTY_FORM } from '#search/form.ts';
import { SearchFormPanel } from '#search/SearchFormPanel.tsx';

// Ketcher cannot run in happy-dom; this dialog saves benzene, in the format asked for.
vi.mock('@open-reaction-database/ui/ketcher', () => ({
  StructureDialog: ({
    opened,
    format,
    onClose,
    onSave,
  }: Readonly<{
    opened: boolean;
    format: string;
    onClose: () => void;
    onSave: (structure: string) => void;
  }>) =>
    opened ? (
      <div role="dialog">
        <button
          type="button"
          onClick={() => onSave(format === 'smarts' ? 'c1ccccc1' : 'C1=CC=CC=C1')}
        >
          Save drawing
        </button>
        <button
          type="button"
          onClick={onClose}
        >
          Cancel drawing
        </button>
      </div>
    ) : null,
}));

/** Each tags field: its label, its key in the form, and a value to type. */
const TAG_FIELDS = [
  ['Dataset IDs', 'datasetIds', 'ord_dataset-1'],
  ['DOIs', 'dois', '10.1021/x'],
  ['Reaction IDs', 'reactionIds', 'ord-1'],
];

function setUp(initial = EMPTY_FORM) {
  const onSearch = vi.fn();
  const user = userEvent.setup();
  const view = renderAt(
    '/search',
    <SearchFormPanel
      initial={initial}
      onSearch={onSearch}
    />,
  );
  return { ...view, onSearch, user };
}

describe('SearchFormPanel', () => {
  it('searches for a typed structure', async () => {
    const { getByRole, onSearch, user } = setUp();
    await user.click(getByRole('button', { name: 'Add a structure' }));
    await user.type(getByRole('textbox', { name: 'Structure 1' }), 'CCN');
    await user.selectOptions(
      getByRole('combobox', { name: 'Match for structure 1' }),
      'similar',
    );
    await user.selectOptions(
      getByRole('combobox', { name: 'Side for structure 1' }),
      'output',
    );
    await user.click(getByRole('button', { name: 'Search' }));
    expect(onSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        structures: [{ pattern: 'CCN', target: 'output', mode: 'similar' }],
      }),
    );
  });

  it('draws a structure', async () => {
    const { getByRole, user } = setUp();
    await user.click(getByRole('button', { name: 'Add a structure' }));
    await user.click(getByRole('button', { name: 'Draw structure 1' }));
    await user.click(getByRole('button', { name: 'Save drawing' }));
    expect(getByRole('textbox', { name: 'Structure 1' })).toHaveValue('C1=CC=CC=C1');
  });

  it('closes the drawing without changing the structure', async () => {
    const { getByRole, queryByRole, user } = setUp({
      ...EMPTY_FORM,
      structures: [{ pattern: 'CCN', target: 'input', mode: 'exact' }],
    });
    await user.click(getByRole('button', { name: 'Draw structure 1' }));
    await user.click(getByRole('button', { name: 'Cancel drawing' }));
    expect(queryByRole('dialog')).not.toBeInTheDocument();
    expect(getByRole('textbox', { name: 'Structure 1' })).toHaveValue('CCN');
  });

  it('draws a SMARTS in SMARTS mode', async () => {
    const { getByRole, user } = setUp();
    await user.click(getByRole('button', { name: 'Add a structure' }));
    await user.selectOptions(
      getByRole('combobox', { name: 'Match for structure 1' }),
      'smarts',
    );
    await user.click(getByRole('button', { name: 'Draw structure 1' }));
    await user.click(getByRole('button', { name: 'Save drawing' }));
    expect(getByRole('textbox', { name: 'Structure 1' })).toHaveValue('c1ccccc1');
  });

  it('asks for the threshold only for a similar structure', async () => {
    const { getByRole, queryByRole, user } = setUp();
    await user.click(getByRole('button', { name: 'Add a structure' }));
    expect(
      queryByRole('textbox', { name: 'Similarity threshold' }),
    ).not.toBeInTheDocument();
    await user.selectOptions(
      getByRole('combobox', { name: 'Match for structure 1' }),
      'similar',
    );
    expect(getByRole('textbox', { name: 'Similarity threshold' })).toHaveValue('0.5');
  });

  it('removes a structure', async () => {
    const { getByRole, queryByRole, user } = setUp();
    await user.click(getByRole('button', { name: 'Add a structure' }));
    await user.click(getByRole('button', { name: 'Remove structure 1' }));
    expect(queryByRole('textbox', { name: 'Structure 1' })).not.toBeInTheDocument();
  });

  it('edits only the structure typed into', async () => {
    const { getByRole, onSearch, user } = setUp({
      ...EMPTY_FORM,
      structures: [
        { pattern: 'CCN', target: 'input', mode: 'exact' },
        { pattern: 'CCO', target: 'input', mode: 'exact' },
      ],
    });
    await user.type(getByRole('textbox', { name: 'Structure 2' }), 'C');
    await user.click(getByRole('button', { name: 'Search' }));
    expect(
      onSearch.mock.calls[0][0].structures.map(
        ({ pattern }: { pattern: string }) => pattern,
      ),
    ).toEqual(['CCN', 'CCOC']);
  });

  it('keeps a drawing with its structure when one before it is removed', async () => {
    const { getByRole, user } = setUp({
      ...EMPTY_FORM,
      structures: [
        { pattern: 'CCN', target: 'input', mode: 'exact' },
        { pattern: 'CCO', target: 'input', mode: 'exact' },
      ],
    });
    await user.click(getByRole('button', { name: 'Draw structure 2' }));
    await user.click(getByRole('button', { name: 'Remove structure 1' }));
    await user.click(getByRole('button', { name: 'Save drawing' }));
    expect(getByRole('textbox', { name: 'Structure 1' })).toHaveValue('C1=CC=CC=C1');
  });

  it('starts from the form it is given', () => {
    const { getByRole } = setUp({
      ...EMPTY_FORM,
      structures: [{ pattern: 'CCN', target: 'input', mode: 'exact' }],
      reactionSmarts: ['[N:1]>>[N:1]', '[O:1]>>[O:1]'],
      reactionIds: ['ord-1'],
      limit: 250,
    });
    expect(getByRole('textbox', { name: 'Structure 1' })).toHaveValue('CCN');
    expect(getByRole('textbox', { name: 'Reaction SMARTS' })).toHaveValue(
      '[N:1]>>[N:1]\n[O:1]>>[O:1]',
    );
    expect(getByRole('textbox', { name: 'Limit' })).toHaveValue('250');
  });

  it('reads one reaction SMARTS per line, ignoring blank ones', async () => {
    const { getByRole, onSearch, user } = setUp();
    await user.type(
      getByRole('textbox', { name: 'Reaction SMARTS' }),
      'A>>B{Enter}{Enter}C>>D',
    );
    await user.click(getByRole('button', { name: 'Search' }));
    expect(onSearch.mock.calls[0][0].reactionSmarts).toEqual(['A>>B', 'C>>D']);
  });

  it('moves a yield bound with the keyboard', async () => {
    const { getAllByRole, getByRole, onSearch, user } = setUp();
    const [yieldLow] = getAllByRole('slider');
    fireEvent.keyDown(yieldLow, { key: 'ArrowRight' });
    await user.click(getByRole('button', { name: 'Search' }));
    expect(onSearch.mock.calls[0][0].yieldRange).toEqual([1, 100]);
  });

  it('takes a limit typed over the old one', async () => {
    const { getByRole, onSearch, user } = setUp();
    const limit = getByRole('textbox', { name: 'Limit' });
    await user.clear(limit);
    await user.type(limit, '250');
    await user.click(getByRole('button', { name: 'Search' }));
    expect(onSearch.mock.calls[0][0].limit).toBe(250);
  });

  it('holds a typed limit to the most the backend returns', async () => {
    const { getByRole, onSearch, user } = setUp();
    const limit = getByRole('textbox', { name: 'Limit' });
    await user.clear(limit);
    await user.type(limit, '5000');
    await user.click(getByRole('button', { name: 'Search' }));
    expect(onSearch.mock.calls[0][0].limit).toBe(1000);
  });

  it('holds a limit entered with Enter to the most the backend returns', async () => {
    const { getByRole, onSearch, user } = setUp();
    const limit = getByRole('textbox', { name: 'Limit' });
    await user.clear(limit);
    await user.type(limit, '5000{Enter}');
    expect(onSearch.mock.calls[0][0].limit).toBe(1000);
  });

  it.each([
    ['5', 1],
    ['0.01', 0.05],
  ])('holds a threshold of %s entered with Enter to %s', async (typed, searched) => {
    const { getByRole, onSearch, user } = setUp({
      ...EMPTY_FORM,
      structures: [{ pattern: 'CCN', target: 'input', mode: 'similar' }],
    });
    const threshold = getByRole('textbox', { name: 'Similarity threshold' });
    await user.clear(threshold);
    await user.type(threshold, `${typed}{Enter}`);
    expect(onSearch.mock.calls[0][0].similarity).toBe(searched);
  });

  it('takes a threshold typed over the old one', async () => {
    const { getByRole, onSearch, user } = setUp({
      ...EMPTY_FORM,
      structures: [{ pattern: 'CCN', target: 'input', mode: 'similar' }],
    });
    const threshold = getByRole('textbox', { name: 'Similarity threshold' });
    await user.clear(threshold);
    await user.type(threshold, '0.8');
    await user.click(getByRole('button', { name: 'Search' }));
    expect(onSearch.mock.calls[0][0].similarity).toBeCloseTo(0.8);
  });

  it('offers stereochemistry only for a pattern it applies to', async () => {
    const { getByRole, user } = setUp();
    const stereochemistry = getByRole('checkbox', { name: 'Match stereochemistry' });
    expect(stereochemistry).toBeDisabled();
    await user.click(getByRole('button', { name: 'Add a structure' }));
    expect(stereochemistry).toBeDisabled();
    await user.selectOptions(
      getByRole('combobox', { name: 'Match for structure 1' }),
      'substructure',
    );
    expect(stereochemistry).toBeEnabled();
    await user.selectOptions(
      getByRole('combobox', { name: 'Match for structure 1' }),
      'smarts',
    );
    expect(stereochemistry).toBeEnabled();
    await user.selectOptions(
      getByRole('combobox', { name: 'Match for structure 1' }),
      'similar',
    );
    expect(stereochemistry).toBeDisabled();
  });

  it('matches stereochemistry for a reaction SMARTS', async () => {
    const { getByRole, onSearch, user } = setUp();
    await user.type(getByRole('textbox', { name: 'Reaction SMARTS' }), 'A>>B');
    await user.click(getByRole('checkbox', { name: 'Match stereochemistry' }));
    await user.click(getByRole('button', { name: 'Search' }));
    expect(onSearch.mock.calls[0][0].useStereochemistry).toBe(true);
  });

  it('moves a conversion bound with the keyboard', async () => {
    const { getAllByRole, getByRole, onSearch, user } = setUp();
    const conversionLow = getAllByRole('slider')[2];
    fireEvent.keyDown(conversionLow, { key: 'ArrowRight' });
    await user.click(getByRole('button', { name: 'Search' }));
    expect(onSearch.mock.calls[0][0].conversionRange).toEqual([1, 100]);
  });

  it.each(TAG_FIELDS)('takes %s as tags', async (label, field, value) => {
    const { getByRole, onSearch, user } = setUp();
    await user.type(getByRole('textbox', { name: label }), `${value}{Enter}`);
    await user.click(getByRole('button', { name: 'Search' }));
    expect(onSearch.mock.calls[0][0][field]).toEqual([value]);
  });

  it.each(TAG_FIELDS)(
    'adds a tag to %s on Enter, and searches on the next',
    async (label, field, value) => {
      const { getByRole, onSearch, user } = setUp();
      const tags = getByRole('textbox', { name: label });
      await user.type(tags, `${value}{Enter}`);
      expect(onSearch).not.toHaveBeenCalled();
      await user.type(tags, '{Enter}');
      expect(onSearch).toHaveBeenCalledOnce();
      expect(onSearch.mock.calls[0][0][field]).toEqual([value]);
    },
  );

  it('clears the form', async () => {
    const { getByRole, queryByRole, user } = setUp({
      ...EMPTY_FORM,
      structures: [{ pattern: 'CCN', target: 'input', mode: 'exact' }],
    });
    await user.click(getByRole('button', { name: 'Clear' }));
    expect(queryByRole('textbox', { name: 'Structure 1' })).not.toBeInTheDocument();
  });
});
