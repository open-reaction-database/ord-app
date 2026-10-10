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
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import { ReactionNodeValidationResult } from './ReactionNodeValidationResult.tsx';

describe('ReactionNodeValidationResult under a provider', () => {
  it('counts the errors under its path', () => {
    const { getByText } = renderInReactionView(
      <ReactionNodeValidationResult pathComponents={['notes']} />,
      {
        record: {
          validation: {
            errors: [
              {
                text: 'bad note',
                path: ['notes', 'procedureDetails'],
                originalPath: 'notes.procedureDetails',
              },
            ],
            warnings: [],
          },
        },
      },
    );
    expect(getByText('1')).toBeInTheDocument();
  });

  it('renders nothing for a template, which has no validation', () => {
    const { container } = renderInReactionView(
      <ReactionNodeValidationResult pathComponents={['notes']} />,
      { reactionId: 'template_1' },
    );
    // MantineProvider injects a <style> tag, so look for the badge itself.
    expect(container.querySelector('.mantine-Badge-root')).toBeNull();
  });
});
