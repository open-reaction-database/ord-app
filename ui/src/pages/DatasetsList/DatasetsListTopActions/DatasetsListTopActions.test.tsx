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
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { DatasetsListTopActions } from './DatasetsListTopActions.tsx';

// The create flows / wizard have their own store + form deps; stub them so this test focuses on the
// top-action buttons and the disclosure that mounts the create-from-scratch modal.
vi.mock('features/datasets/CreateNewDataset/CreateNewDataset.tsx', () => ({
  CreateNewDataset: () => <div data-testid="create-new-dataset" />,
}));
vi.mock('features/datasets/CreateDatasetFromFile/CreateDatasetFromFile.tsx', () => ({
  CreateDatasetFromFile: () => <div data-testid="create-from-file" />,
}));
vi.mock('features/enumeration/EnumerationWizard.tsx', () => ({
  EnumerationWizard: () => <div />,
}));

describe('DatasetsListTopActions', () => {
  it('renders the three dataset-creation entry points', () => {
    const { getByText } = renderWithProviders(<DatasetsListTopActions />);
    expect(getByText('New Dataset')).toBeInTheDocument();
    expect(getByText('From File')).toBeInTheDocument();
    expect(getByText('Enumerate')).toBeInTheDocument();
  });

  it('opens the create-from-scratch modal when "New Dataset" is clicked', () => {
    const { getByText, queryByTestId } = renderWithProviders(
      <DatasetsListTopActions />,
    );
    expect(queryByTestId('create-new-dataset')).not.toBeInTheDocument();
    fireEvent.click(getByText('New Dataset'));
    expect(queryByTestId('create-new-dataset')).toBeInTheDocument();
  });

  it('opens the create-from-file modal when "From File" is clicked', () => {
    const { getByText, queryByTestId } = renderWithProviders(
      <DatasetsListTopActions />,
    );
    expect(queryByTestId('create-from-file')).not.toBeInTheDocument();
    fireEvent.click(getByText('From File'));
    expect(queryByTestId('create-from-file')).toBeInTheDocument();
  });
});
