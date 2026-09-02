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
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosInstance from 'store/axiosInstance.ts';
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { GroupTrash } from './GroupTrash.tsx';

vi.mock('store/axiosInstance.ts', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const axiosMock = axiosInstance as unknown as Record<
  'get' | 'post',
  ReturnType<typeof vi.fn>
>;

beforeEach(() => {
  vi.clearAllMocks();
  axiosMock.get.mockResolvedValue({
    data: {
      datasets: [
        {
          id: 1,
          name: null,
          deleted_at: '2026-08-19T12:00:00',
          deleted_by: null,
        },
      ],
      reactions: [
        {
          id: 2,
          pb_reaction_id: 'rxn-2',
          deleted_at: '2026-08-19T12:00:00',
          deleted_by: { name: null },
        },
      ],
    },
  });
  axiosMock.post.mockResolvedValue({ data: {} });
});

describe('GroupTrash', () => {
  it('loads trash and handles nullable names and deleters', async () => {
    renderWithProviders(<GroupTrash groupId={7} />);

    await waitFor(() => expect(axiosMock.get).toHaveBeenCalledWith('/groups/7/trash'));
    expect(await screen.findByText('(unnamed)')).toBeInTheDocument();
    expect(screen.getByText('rxn-2')).toBeInTheDocument();
    expect(screen.getAllByText('Unknown')).toHaveLength(2);
  });

  it('restores the selected item', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GroupTrash groupId={7} />);

    const restoreButtons = await screen.findAllByRole('button', { name: 'Restore' });
    await user.click(restoreButtons[0]);

    await waitFor(() =>
      expect(axiosMock.post).toHaveBeenCalledWith('/groups/7/trash/restore', {
        kind: 'dataset',
        id: 1,
      }),
    );
    await waitFor(() =>
      expect(screen.queryByText('(unnamed)')).not.toBeInTheDocument(),
    );
  });

  it('warns that emptying permanently deletes shared datasets', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GroupTrash groupId={7} />);

    await screen.findByText('(unnamed)');
    await user.click(screen.getByRole('button', { name: 'Empty' }));

    expect(
      screen.getByText(/Shared datasets will be permanently deleted for every group/),
    ).toBeInTheDocument();
  });
});
