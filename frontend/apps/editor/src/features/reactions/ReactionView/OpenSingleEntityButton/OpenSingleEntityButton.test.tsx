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
import { OpenSingleEntityButton } from './OpenSingleEntityButton.tsx';

describe('OpenSingleEntityButton', () => {
  it.each([
    [{}, 'Edit'],
    [{ isViewOnly: true }, 'View'],
    [{ reactionId: 'template_1' }, 'Set variables'],
  ] as const)('with %o reads %s', (options, label) => {
    const { getByRole } = renderInReactionView(
      <OpenSingleEntityButton pathComponents={['notes']} />,
      options,
    );
    expect(getByRole('button', { name: label })).toBeInTheDocument();
  });
});
