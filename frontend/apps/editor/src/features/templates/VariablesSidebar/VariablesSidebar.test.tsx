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
import { fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { useDrawerStack } from '@open-reaction-database/ui/reaction';
import { reactionFlatPathToSidebars } from '@open-reaction-database/ui/reaction/model';
import { TemplateReactionProvider } from 'features/templates/TemplateReactionProvider/TemplateReactionProvider.tsx';
import { VariablesSidebar } from './VariablesSidebar.tsx';
import type { AppState } from 'store/configureAppStore.ts';

const buildState = (isOpened: boolean): { preloadedState: AppState } => ({
  preloadedState: {
    features: { variablesSidebar: { isVariablesSidebarOpened: isOpened } },
    entities: {
      reactions: {
        reactionsById: {
          template_1: {
            id: 1,
            data: {},
            variables: { v1: { name: 'reagent', path: ['notes', 'procedureDetails'] } },
          },
        },
      },
    },
  } as unknown as AppState,
});

describe('VariablesSidebar', () => {
  it('lists the template variables when the drawer is open', () => {
    const { getByText } = renderWithProviders(
      <TemplateReactionProvider templateId="template_1">
        <VariablesSidebar templateId="template_1" />
      </TemplateReactionProvider>,
      buildState(true),
    );
    expect(getByText('Variables')).toBeInTheDocument();
    expect(getByText('@reagent')).toBeInTheDocument();
  });

  it('does not render the drawer title or the variable list while closed', () => {
    const { queryByText } = renderWithProviders(
      <TemplateReactionProvider templateId="template_1">
        <VariablesSidebar templateId="template_1" />
      </TemplateReactionProvider>,
      buildState(false),
    );
    expect(queryByText('Variables')).not.toBeInTheDocument();
    expect(queryByText('@reagent')).not.toBeInTheDocument();
  });

  it('closes and opens the variable’s entity in the reaction drawer when a variable is clicked', async () => {
    function StackProbe() {
      return <output>{JSON.stringify(useDrawerStack())}</output>;
    }
    const { getByText, queryByText, getByRole } = renderWithProviders(
      <TemplateReactionProvider templateId="template_1">
        <VariablesSidebar templateId="template_1" />
        <StackProbe />
      </TemplateReactionProvider>,
      buildState(true),
    );
    fireEvent.click(getByText('@reagent'));
    expect(getByRole('status')).toHaveTextContent(
      JSON.stringify(reactionFlatPathToSidebars(['notes', 'procedureDetails'])),
    );
    await waitFor(() => expect(queryByText('@reagent')).not.toBeInTheDocument());
  });
});
