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
import type { ReactNode } from 'react';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { NotFoundPage } from './NotFoundPage.tsx';

// PageContainer pulls in the auth-aware UserMenu; stub it to a passthrough so this test stays
// focused on the not-found content.
vi.mock('common/components/PageContainer/PageContainer.tsx', () => ({
  PageContainer: ({ children }: Readonly<{ children: ReactNode }>) => <div>{children}</div>,
}));

describe('NotFoundPage', () => {
  it('defaults to a 404 with a generic message and a link to the datasets page', () => {
    const { getByText, getByRole } = renderWithMantine(<NotFoundPage />);
    expect(getByText('404')).toBeInTheDocument();
    expect(getByText(/could not be found/)).toBeInTheDocument();
    expect(getByRole('button', { name: /Datasets/ })).toBeInTheDocument();
  });

  it('shows the provided error code and message', () => {
    const { getByText } = renderWithMantine(
      <NotFoundPage rejectValue={{ errorCode: 403, errorMessage: 'You do not have access' }} />,
    );
    expect(getByText('403')).toBeInTheDocument();
    expect(getByText('You do not have access')).toBeInTheDocument();
  });
});
