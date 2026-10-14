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
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '@open-reaction-database/ui/theme';
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { createQueryClient } from '#api/queryClient.ts';

/**
 * Renders ui inside the viewer's providers, at path (which may carry a query string).
 *
 * Each call gets its own cache, so no test sees another's responses; a rerender keeps
 * the providers, the cache, and the location.
 *
 * Returns Testing Library's result and `history`, every path the router has been at,
 * oldest first; a redirect with `replace` overwrites the last.
 */
export function renderAt(path: string, ui: ReactElement) {
  const location = memoryLocation({ path, record: true });
  const client = createQueryClient();
  function Providers({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <MantineProvider theme={theme}>
        <Notifications />
        <QueryClientProvider client={client}>
          <Router
            hook={location.hook}
            searchHook={location.searchHook}
          >
            {children}
          </Router>
        </QueryClientProvider>
      </MantineProvider>
    );
  }
  const result = render(ui, { wrapper: Providers });
  return { ...result, history: location.history };
}
