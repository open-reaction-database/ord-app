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
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { ReactionValidationResult } from './ReactionValidationResult.tsx';
import type { AppState } from 'store/configureAppStore.ts';

const stateWith = (record: object): { preloadedState: AppState } => ({
  preloadedState: {
    entities: { reactions: { reactionsById: { 1: { id: 1, data: {}, ...record } } } },
  } as unknown as AppState,
});

describe('ReactionValidationResult', () => {
  it('shows pluralized error and warning counts when the reaction is invalid', () => {
    const { getByText } = renderWithProviders(
      <ReactionValidationResult reactionId={1} />,
      stateWith({ is_valid: false, validation: { errors: [{ text: 'a' }, { text: 'b' }], warnings: [{ text: 'c' }] } }),
    );
    expect(getByText('2 errors')).toBeInTheDocument();
    expect(getByText('1 warning')).toBeInTheDocument();
  });

  it('shows neither an error nor a warning count when the reaction is valid', () => {
    const { queryByText } = renderWithProviders(
      <ReactionValidationResult reactionId={1} />,
      stateWith({ is_valid: true, validation: null }),
    );
    expect(queryByText(/error/)).not.toBeInTheDocument();
    expect(queryByText(/warning/)).not.toBeInTheDocument();
  });
});
