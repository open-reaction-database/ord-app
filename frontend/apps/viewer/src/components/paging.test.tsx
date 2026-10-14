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
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderAt } from '#test/render.tsx';
import { usePaging } from '#components/paging.tsx';

const ITEMS = Array.from({ length: 23 }, (_, index) => `item ${index + 1}`);

function Paged({ items }: Readonly<{ items: ReadonlyArray<string> }>) {
  const { pageItems, controls } = usePaging(items, 'items');
  return (
    <>
      {controls}
      <ul>
        {pageItems.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}

describe('usePaging', () => {
  it('shows ten to a page, and counts them all', () => {
    const { getAllByRole, getByText } = renderAt('/', <Paged items={ITEMS} />);
    expect(getAllByRole('listitem')).toHaveLength(10);
    expect(getByText('of 23 items')).toBeInTheDocument();
  });

  it('moves between pages', async () => {
    const user = userEvent.setup();
    const { getAllByRole, getByRole } = renderAt('/', <Paged items={ITEMS} />);
    await user.click(getByRole('button', { name: '3' }));
    expect(getAllByRole('listitem').map(item => item.textContent)).toEqual([
      'item 21',
      'item 22',
      'item 23',
    ]);
  });

  it('starts again from the first page at a new page size', async () => {
    const user = userEvent.setup();
    const items = Array.from({ length: 60 }, (_, index) => `item ${index + 1}`);
    const { getAllByRole, getByRole } = renderAt('/', <Paged items={items} />);
    await user.click(getByRole('button', { name: '3' }));
    await user.selectOptions(getByRole('combobox', { name: 'Per page' }), '25');
    // Page 3 of 25 would be items 51 to 60.
    expect(getAllByRole('listitem').map(item => item.textContent)).toEqual(
      items.slice(0, 25),
    );
  });

  it('starts again from the first page for new items', async () => {
    const user = userEvent.setup();
    const { getAllByRole, getByRole, rerender } = renderAt(
      '/',
      <Paged items={ITEMS} />,
    );
    await user.click(getByRole('button', { name: '3' }));
    // Page 3 of these would be items 21 to 23.
    rerender(<Paged items={ITEMS.slice(0, 23)} />);
    expect(getAllByRole('listitem').map(item => item.textContent)).toEqual(
      ITEMS.slice(0, 10),
    );
  });
});
