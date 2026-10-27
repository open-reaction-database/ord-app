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
 * Writes a path's fragment into the page's own address, where `useFragmentParams` reads
 * it, or clears the address's fragment for a path without one.
 */
function showFragment(path: string) {
  const at = path.indexOf('#');
  const fragment = at === -1 ? '' : path.slice(at);
  const { pathname, search } = globalThis.location;
  globalThis.history.replaceState(null, '', `${pathname}${search}${fragment}`);
}

/**
 * Renders ui inside the viewer's providers, at path (which may carry a query string or a
 * fragment).
 *
 * Each call gets its own cache, so no test sees another's responses; a rerender keeps
 * the providers, the cache, and the location. wouter's memory location keeps a path
 * whole, so routes are matched against the path without its fragment, as a browser's
 * location gives it, and the fragment is written into the page's own address.
 *
 * Returns Testing Library's result and `history`, every path the router has been at,
 * oldest first; a redirect with `replace` overwrites the last.
 */
export function renderAt(path: string, ui: ReactElement) {
  const location = memoryLocation({ path, record: true });
  showFragment(path);
  const navigate = (to: string, options?: { replace?: boolean }) => {
    location.navigate(to, options);
    showFragment(to);
  };
  function useLocation(): [string, typeof navigate] {
    const [current] = location.hook();
    return [current.split('#')[0], navigate];
  }
  const client = createQueryClient();
  function Providers({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <MantineProvider theme={theme}>
        <Notifications />
        <QueryClientProvider client={client}>
          <Router
            hook={useLocation}
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
