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
import { ReactionValueLabelWrapper } from './ReactionValueLabelWrapper.tsx';
import type { ReactionValueLabelProps } from './ReactionInteractions/ReactionValueLabel/reactionValueLabel.types.ts';
import { VariableType } from 'store/entities/templates/templates.types.ts';

// Smoke test: mounts within seeded reaction/entity contexts + store without throwing.
const Component = ReactionValueLabelWrapper as unknown as () => JSX.Element;

describe('ReactionValueLabelWrapper', () => {
  it('mounts without crashing', () => {
    const { container } = renderInReactionView(<Component />);
    expect(container).toBeInTheDocument();
  });

  const Label = ({ name }: Readonly<ReactionValueLabelProps>) => (
    <span>value {name}</span>
  );
  const ViewOnly = ({ name }: Readonly<ReactionValueLabelProps>) => (
    <span>fixed {name}</span>
  );
  const slots = { ValueLabel: Label, ViewOnlyLabel: ViewOnly };

  it('shows the view-only label on a template field that cannot be a variable', () => {
    const { getByText } = renderInReactionView(
      <ReactionValueLabelWrapper
        name="mass"
        type={VariableType.Number}
        wrapperConfig={{ cannotBeVariable: true }}
      />,
      { reactionId: 'template_1', slots },
    );
    expect(getByText('fixed mass')).toBeInTheDocument();
  });

  it('shows the value label on a template field that can be a variable', () => {
    const { getByText } = renderInReactionView(
      <ReactionValueLabelWrapper
        name="mass"
        type={VariableType.Number}
      />,
      { reactionId: 'template_1', slots },
    );
    expect(getByText('value mass')).toBeInTheDocument();
  });

  it('shows the value label on a dataset reaction', () => {
    const { getByText } = renderInReactionView(
      <ReactionValueLabelWrapper
        name="mass"
        type={VariableType.Number}
        wrapperConfig={{ cannotBeVariable: true }}
      />,
      { slots },
    );
    expect(getByText('value mass')).toBeInTheDocument();
  });
});
