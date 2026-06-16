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
import { VariablesSidebar } from './VariablesSidebar.tsx';
import type { AppState } from 'store/configureAppStore.ts';

const buildState = (isOpened: boolean): { preloadedState: AppState } => ({
  preloadedState: {
    features: { variablesSidebar: { isVariablesSidebarOpened: isOpened } },
    entities: {
      reactions: {
        reactionsById: {
          template_1: { id: 1, data: {}, variables: { v1: { name: 'reagent', path: [] } } },
        },
      },
    },
  } as unknown as AppState,
});

describe('VariablesSidebar', () => {
  it('lists the template variables when the drawer is open', () => {
    const { getByText } = renderWithProviders(<VariablesSidebar templateId="template_1" />, buildState(true));
    expect(getByText('Variables')).toBeInTheDocument();
    expect(getByText('@reagent')).toBeInTheDocument();
  });

  it('does not render the drawer title or the variable list while closed', () => {
    const { queryByText } = renderWithProviders(<VariablesSidebar templateId="template_1" />, buildState(false));
    expect(queryByText('Variables')).not.toBeInTheDocument();
    expect(queryByText('@reagent')).not.toBeInTheDocument();
  });
});
