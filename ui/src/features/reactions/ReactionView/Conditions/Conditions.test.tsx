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
import { Conditions } from './Conditions.tsx';

describe('Conditions', () => {
  it('renders the conditions section with each condition-group heading', () => {
    const { getByText } = renderInReactionView(<Conditions reactionId={1} />);
    expect(getByText('Conditions')).toBeInTheDocument();
    for (const heading of ['Temperature', 'Pressure', 'Stirring', 'Illumination', 'Electrochemistry', 'Flow']) {
      expect(getByText(heading)).toBeInTheDocument();
    }
  });
});
