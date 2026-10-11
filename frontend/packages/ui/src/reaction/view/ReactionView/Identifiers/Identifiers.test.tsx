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
import { describe, it, expect } from 'vitest';
import { renderWithReaction } from '#testing/renderWithReaction.tsx';
import { Identifiers } from './Identifiers.tsx';

describe('Identifiers', () => {
  it('renders the identifiers section with the add button when editable', () => {
    const { getByText, getByRole } = renderWithReaction(<Identifiers />, {
      editable: true,
    });
    expect(getByText('Identifiers')).toBeInTheDocument();
    expect(getByText(/Reaction identifiers define/)).toBeInTheDocument();
    expect(getByRole('button', { name: /Identifier/ })).toBeInTheDocument();
  });

  it('hides the add button in view-only mode', () => {
    const { queryByRole } = renderWithReaction(<Identifiers />, {});
    expect(queryByRole('button', { name: /Identifier/ })).not.toBeInTheDocument();
  });
});
