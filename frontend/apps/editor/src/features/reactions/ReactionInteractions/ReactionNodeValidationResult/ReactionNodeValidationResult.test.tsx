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
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { ReactionNodeValidationResultDisplay } from './ReactionNodeValidationResult.tsx';
import type { ReactionValidation } from 'store/entities/reactions/reactions.types.ts';

const validation = {
  errors: [
    { path: ['inputs', '0'], originalPath: 'inputs.0.a', text: 'e1' },
    { path: ['inputs', '0'], originalPath: 'inputs.0.b', text: 'e2' },
  ],
  warnings: [{ path: ['inputs', '0'], originalPath: 'inputs.0.c', text: 'w1' }],
} as unknown as ReactionValidation;

describe('ReactionNodeValidationResultDisplay', () => {
  it('shows red/yellow badges with the error and warning counts matching the path', () => {
    const { getByText } = renderWithMantine(
      <ReactionNodeValidationResultDisplay
        pathComponents={['inputs', '0']}
        validation={validation}
      />,
    );
    expect(getByText('2')).toBeInTheDocument(); // errors at this path
    expect(getByText('1')).toBeInTheDocument(); // warnings at this path
  });

  it('renders nothing when no messages match the path', () => {
    const { queryByText } = renderWithMantine(
      <ReactionNodeValidationResultDisplay
        pathComponents={['conditions']}
        validation={validation}
      />,
    );
    expect(queryByText('2')).not.toBeInTheDocument();
    expect(queryByText('1')).not.toBeInTheDocument();
  });

  it('matches messages under a parent-path prefix (substring path match)', () => {
    // pathComponents=['inputs'] is a prefix of the messages' 'inputs.0.*' paths, so all of them count.
    const { getByText } = renderWithMantine(
      <ReactionNodeValidationResultDisplay
        pathComponents={['inputs']}
        validation={validation}
      />,
    );
    expect(getByText('2')).toBeInTheDocument();
    expect(getByText('1')).toBeInTheDocument();
  });
});
