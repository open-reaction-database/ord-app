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
import { ReactionCard } from 'common/components/ReactionCard/ReactionCard.tsx';
import { ReactionPreview } from 'common/components/ReactionPreview/ReactionPreview.tsx';
import { ReactionHeader } from 'features/reactions/ReactionHeader/ReactionHeader.tsx';
import { ReactionContent } from 'features/reactions/ReactionEntities/ReactionTabs/ReactionContent.tsx';
import { renderOverBothSources } from 'test/renderOverBothSources.tsx';

describe('the reaction view over either source', () => {
  it.each([
    [
      'every section',
      <ReactionContent
        key="content"
        viewMode="list"
      />,
    ],
    ['the preview', <ReactionPreview key="preview" />],
    ['the header', <ReactionHeader key="header" />],
    [
      'a card',
      <ReactionCard
        key="card"
        title="Card"
        actions={null}
      />,
    ],
  ])('renders %s the same', (_name, ui) => {
    const [overStatic, overRedux] = renderOverBothSources(ui);
    expect(overStatic).toBe(overRedux);
    expect(overStatic.length).toBeGreaterThan(0);
  });
});
