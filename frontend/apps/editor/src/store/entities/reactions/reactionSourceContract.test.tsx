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
import { reactionNodeToComponent } from 'features/reactions/ReactionEntities';
import { ReactionEntityForm } from 'features/reactions/ReactionEntities/ReactionEntityForm/ReactionEntityForm.tsx';
import { nodeToComponentContext } from 'features/reactions/ReactionEntities/reactionEntityNode/reactionEntityNode.context.ts';
import { getSidebarInfo } from 'features/reactions/ReactionEntities/sidebarInfo/getSidebarInfo.tsx';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type { ReactionSnapshot } from 'features/reactions/provider/reactionProvider.types.ts';
import { fullReactionSnapshot } from 'test/fullReactionSnapshot.ts';
import { renderOverBothSources } from 'test/renderOverBothSources.tsx';

// Ketcher needs a canvas to load; its editor opens only on demand and reads no reaction state.
vi.mock(
  'features/reactions/ReactionEntities/entityFormConfiguration/components/CustomIdentifiers/ComponentsKetcherEditor/ComponentsKetcherEditor.tsx',
  () => ({ ComponentsKetcherEditor: () => null }),
);

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

function FormAt({
  pathComponents,
}: Readonly<{ pathComponents: ReactionPathComponents }>) {
  return (
    <nodeToComponentContext.Provider value={reactionNodeToComponent}>
      <ReactionEntityForm
        reactionPathComponents={pathComponents}
        sidebarInfo={getSidebarInfo([...pathComponents].reverse())}
        isHidden={false}
        onFormClose={() => undefined}
        onSetFormDirty={() => undefined}
      />
    </nodeToComponentContext.Provider>
  );
}

/** The path of a drawer form for each entity the fixture holds; inputs are keyed by generated ID. */
const FORMS: Array<
  [string, (data: ReactionSnapshot['data']) => ReactionPathComponents]
> = [
  ['an input', data => ['inputs', Object.keys(data.inputs)[0]]],
  [
    'an input component',
    data => ['inputs', Object.keys(data.inputs)[0], 'components', 0],
  ],
  ['an outcome', () => ['outcomes', 0]],
  ['a product', () => ['outcomes', 0, 'products', 0]],
  ['the conditions', () => ['conditions']],
  ['the setup', () => ['setup']],
  ['the notes', () => ['notes']],
  ['the provenance', () => ['provenance']],
  ['an identifier', () => ['identifiers', 0]],
  ['an observation', () => ['observations', 0]],
  ['a workup', () => ['workups', 0]],
];

describe('the drawer forms over either source', () => {
  it.each(FORMS)('render %s the same', (_name, pathTo) => {
    const snapshot = fullReactionSnapshot();
    const [overStatic, overRedux] = renderOverBothSources(
      <FormAt pathComponents={pathTo(snapshot.data)} />,
      snapshot,
    );
    expect(overStatic).toBe(overRedux);
    expect(overStatic.length).toBeGreaterThan(0);
  });
});
