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
import { render, type RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from 'store/rootReducer.ts';
import type { AppState } from 'store/configureAppStore.ts';
import type { ReactElement, ReactNode } from 'react';

interface ProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<AppState>;
}

/**
 * Renders a store-connected component inside a fresh Redux store + MantineProvider. Seed only the
 * slices the component reads via `preloadedState`; the rest fall back to their reducer defaults.
 */
export function renderWithProviders(ui: ReactElement, { preloadedState, ...options }: ProvidersOptions = {}) {
  const store = configureStore({ reducer: rootReducer, preloadedState: preloadedState as AppState });
  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <Provider store={store}>
        <MantineProvider>{children}</MantineProvider>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}
