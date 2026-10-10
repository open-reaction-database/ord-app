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
import { Setup } from './Setup.tsx';

describe('Setup', () => {
  it('renders the setup section with the vessel and material fields', () => {
    const { getByText } = renderInReactionView(<Setup reactionId={1} />);
    expect(getByText('Setup')).toBeInTheDocument();
    // KeyValueDisplay renders each label with a trailing colon.
    expect(getByText('Vessel:')).toBeInTheDocument();
    expect(getByText('Material:')).toBeInTheDocument();
  });
});
