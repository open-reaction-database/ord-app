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
import {
  useIsTemplate,
  useReactionSnapshot,
} from 'features/reactions/provider/reactionProvider.hooks.ts';
import type { AppState } from 'store/configureAppStore.ts';
import { emptyReactionData } from 'test/renderInReactionView.tsx';
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { TemplateReactionProvider } from './TemplateReactionProvider.tsx';

function Probe() {
  const snapshot = useReactionSnapshot();
  return (
    <span>
      {String(useIsTemplate())} {snapshot ? 'loaded' : 'missing'}
    </span>
  );
}

describe('TemplateReactionProvider', () => {
  it('provides the template from the store, read-only', () => {
    const { getByText } = renderWithProviders(
      <TemplateReactionProvider templateId="template_3">
        <Probe />
      </TemplateReactionProvider>,
      {
        preloadedState: {
          entities: {
            reactions: {
              reactionsById: {
                template_3: {
                  id: 'template_3',
                  data: emptyReactionData(),
                  previews: {},
                },
              },
            },
          },
        } as unknown as AppState,
      },
    );
    expect(getByText('true loaded')).toBeInTheDocument();
  });
});
