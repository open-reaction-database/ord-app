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
import { fireEvent } from '@testing-library/react';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { ShareDataset } from './ShareDataset.tsx';
import type { Dataset } from 'store/entities/datasets/datasets.types.ts';

vi.mock('./ShareDatasetSidebar.tsx', () => ({
  ShareDatasetSidebar: () => <div data-testid="share-sidebar" />,
}));

const dataset = (is_sharable: boolean) =>
  ({ id: 1, is_sharable }) as unknown as Dataset;

describe('ShareDataset', () => {
  it('shows the Share button for a sharable dataset and opens the sidebar on click', () => {
    const { getByText, queryByTestId } = renderWithMantine(
      <ShareDataset dataset={dataset(true)} />,
    );
    expect(queryByTestId('share-sidebar')).not.toBeInTheDocument();
    fireEvent.click(getByText('Share'));
    expect(queryByTestId('share-sidebar')).toBeInTheDocument();
  });

  it('hides the Share button when the dataset is not sharable', () => {
    const { queryByText } = renderWithMantine(
      <ShareDataset dataset={dataset(false)} />,
    );
    expect(queryByText('Share')).not.toBeInTheDocument();
  });
});
