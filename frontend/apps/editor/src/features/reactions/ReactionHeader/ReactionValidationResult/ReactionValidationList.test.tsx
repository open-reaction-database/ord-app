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
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import { ReactionValidationList } from './ReactionValidationList.tsx';
import type { ReactionValidation } from '@open-reaction-database/ui/reaction/model';

const validation: ReactionValidation = {
  errors: [{ text: 'Reaction inputs are required' }],
  warnings: [{ text: 'Consider adding a yield' }],
};

describe('ReactionValidationList', () => {
  it('renders the drawer with the error and warning messages when opened', () => {
    const { getByText } = renderInReactionView(
      <ReactionValidationList
        opened
        onClose={() => {}}
        validation={validation}
      />,
    );
    expect(getByText('Validation Results')).toBeInTheDocument();
    expect(getByText('Reaction inputs are required')).toBeInTheDocument();
    expect(getByText('Consider adding a yield')).toBeInTheDocument();
  });

  it('does not render the drawer contents when closed', () => {
    const { queryByText } = renderInReactionView(
      <ReactionValidationList
        opened={false}
        onClose={() => {}}
        validation={validation}
      />,
    );
    expect(queryByText('Reaction inputs are required')).not.toBeInTheDocument();
  });
});
