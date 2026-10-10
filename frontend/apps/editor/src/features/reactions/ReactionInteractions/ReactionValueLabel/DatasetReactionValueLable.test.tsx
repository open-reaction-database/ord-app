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
import { DatasetReactionValueLabel } from './DatasetReactionValueLable.tsx';
import { VariableType } from 'store/entities/templates/templates.types.ts';
import type { ReactionValueLabelProps } from './reactionValueLabel.types.ts';

const render = (wrapperConfig: ReactionValueLabelProps['wrapperConfig']) =>
  renderInReactionView(
    <DatasetReactionValueLabel
      name="ph"
      type={VariableType.Number}
      wrapperConfig={wrapperConfig}
    />,
    { pathComponents: ['conditions'] },
  );

describe('DatasetReactionValueLabel', () => {
  it('renders the label and any children when a label is configured', () => {
    const { getByText } = render({ label: 'pH', children: <span>extra</span> });
    expect(getByText('pH')).toBeInTheDocument();
    expect(getByText('extra')).toBeInTheDocument();
  });

  it('renders nothing — not even children — when no label is configured', () => {
    // children ARE passed here, so their absence proves the no-label guard returns null before
    // any children would render (rather than being vacuously true).
    const { queryByText } = render({ children: <span>orphan</span> });
    expect(queryByText('orphan')).not.toBeInTheDocument();
  });
});
