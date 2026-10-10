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
import { useContext } from 'react';
import { reactionContext } from 'features/reactions/reactions.context.ts';
import {
  useIsTemplate,
  useIsViewOnly,
  useReactionSnapshot,
} from 'features/reactions/provider/reactionProvider.hooks.ts';
import { renderInReactionView } from './renderInReactionView.tsx';

function Probe() {
  const snapshot = useReactionSnapshot();
  const legacy = useContext(reactionContext);
  return (
    <dl>
      <dt>view only</dt>
      <dd>{String(useIsViewOnly())}</dd>
      <dt>template</dt>
      <dd>{String(useIsTemplate())}</dd>
      <dt>legacy id</dt>
      <dd>{String(legacy.reactionId)}</dd>
      <dt>pb id</dt>
      <dd>{snapshot?.pb_reaction_id ?? 'none'}</dd>
    </dl>
  );
}

const shown = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('dd'), dd => dd.textContent);

describe('renderInReactionView', () => {
  it('renders an editable dataset reaction under ReactionProvider by default', () => {
    const { container } = renderInReactionView(<Probe />);
    expect(shown(container)).toEqual(['false', 'false', '1', 'none']);
  });

  it('renders a read-only reaction, with the stored record fields it is given', () => {
    const { container } = renderInReactionView(<Probe />, {
      isViewOnly: true,
      record: { pb_reaction_id: 'ord-1' },
    });
    expect(shown(container)).toEqual(['true', 'false', '1', 'ord-1']);
  });

  it('renders a template for a string ID', () => {
    const { container } = renderInReactionView(<Probe />, { reactionId: 'template_1' });
    expect(shown(container)).toEqual(['true', 'true', 'template_1', 'none']);
  });
});
