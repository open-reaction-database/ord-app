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
import { theme } from '@open-reaction-database/ui/theme';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

/**
 * Renders ui inside the viewer's providers, at path (which may carry a query string).
 *
 * Returns Testing Library's result and `history`, every path the router has been at,
 * oldest first; a redirect with `replace` overwrites the last.
 */
export function renderAt(path: string, ui: ReactElement) {
  const location = memoryLocation({ path, record: true });
  const result = render(
    <MantineProvider theme={theme}>
      <Router
        hook={location.hook}
        searchHook={location.searchHook}
      >
        {ui}
      </Router>
    </MantineProvider>,
  );
  return { ...result, history: location.history };
}
