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
import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { ReactionEditDeleteButtons } from 'features/reactions/ReactionInteractions/ReactionViewDeleteButtons/ReactionEditDeleteButtons.tsx';
import { ReactionViewButton } from 'features/reactions/ReactionInteractions/ReactionViewDeleteButtons/ReactionViewButton.tsx';
import { rootReducer } from 'store/rootReducer.ts';
import { useDatasetReactionProviderProps } from './useDatasetReactionProviderProps.ts';

/** A wrapper over one store, so a rerender keeps the store the hook reads. */
function makeWrapper() {
  const store = configureStore({ reducer: rootReducer });
  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('useDatasetReactionProviderProps', () => {
  it('gives an editable dataset actions and the edit buttons', () => {
    const { result } = renderHook(() => useDatasetReactionProviderProps(1, true), {
      wrapper: makeWrapper(),
    });
    expect(result.current.actions).toBeDefined();
    expect(result.current.slots.ViewDeleteButtons).toBe(ReactionEditDeleteButtons);
  });

  it('gives a read-only dataset no actions and the view button', () => {
    const { result } = renderHook(() => useDatasetReactionProviderProps(1, false), {
      wrapper: makeWrapper(),
    });
    expect(result.current.actions).toBeUndefined();
    expect(result.current.slots.ViewDeleteButtons).toBe(ReactionViewButton);
  });

  it('keeps the same source and actions across renders', () => {
    const { result, rerender } = renderHook(
      () => useDatasetReactionProviderProps(1, true),
      {
        wrapper: makeWrapper(),
      },
    );
    const first = result.current;
    rerender();
    expect(result.current.source).toBe(first.source);
    expect(result.current.actions).toBe(first.actions);
    expect(result.current.slots).toBe(first.slots);
  });
});
