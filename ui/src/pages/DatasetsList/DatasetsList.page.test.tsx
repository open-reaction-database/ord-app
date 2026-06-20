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
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithMantine } from 'test/renderWithMantine.tsx';

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  getInitialDatasetsList: vi.fn((groupId: unknown) => ({ type: 'datasets/getInitial', payload: groupId })),
  activeGroupId: 7 as number | null,
}));
vi.mock('store/useAppDispatch.ts', () => ({ useAppDispatch: () => mocks.dispatch }));
vi.mock('react-redux', () => ({ useSelector: (sel: (s: unknown) => unknown) => sel(undefined) }));
vi.mock('store/features/groups/groups.selectors.ts', () => ({ selectActiveGroupId: () => mocks.activeGroupId }));
vi.mock('store/entities/datasets/datasets.thunks.ts', () => ({ getInitialDatasetsList: mocks.getInitialDatasetsList }));
// Stub the heavy children — the test only covers the page's fetch-on-mount behaviour.
vi.mock('common/components/PageContainer/PageContainer.tsx', () => ({
  PageContainer: ({ children }: Readonly<{ children: React.ReactNode }>) => <div>{children}</div>,
}));
vi.mock('features/groups', () => ({ GroupsSidebar: () => null }));
vi.mock('features/datasets', () => ({ DatasetTable: () => null }));
vi.mock('./DatasetsListTopActions/DatasetsListTopActions.tsx', () => ({ DatasetsListTopActions: () => null }));
vi.mock('features/templates/EntitiesMenu/EntitiesMenu.tsx', () => ({ EntitiesMenu: () => null }));

import { DatasetsListPage } from './DatasetsList.page.tsx';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.activeGroupId = 7;
});

describe('DatasetsListPage', () => {
  it('refetches the datasets list for the active group on mount (#584)', () => {
    renderWithMantine(<DatasetsListPage />);
    expect(mocks.getInitialDatasetsList).toHaveBeenCalledWith(7);
    expect(mocks.dispatch).toHaveBeenCalledWith({ type: 'datasets/getInitial', payload: 7 });
  });
});
