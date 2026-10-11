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
import {
  EMPTY_SLOTS,
  makeContractStore,
  renderOverBothSources,
} from 'test/renderOverBothSources.tsx';
import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { ReactionProvider } from 'features/reactions/provider/ReactionProvider.tsx';
import { createStaticReactionSource } from 'features/reactions/provider/staticReactionSource.ts';

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

/** Drawer forms in the fixture to compare; inputs and analyses are keyed by generated IDs. */
const FORMS: Array<
  [string, (data: ReactionSnapshot['data']) => ReactionPathComponents]
> = [
  ['an input', data => ['inputs', Object.keys(data.inputs)[0]]],
  [
    'an input component',
    data => ['inputs', Object.keys(data.inputs)[0], 'components', 0],
  ],
  [
    'a component identifier',
    data => ['inputs', Object.keys(data.inputs)[0], 'components', 0, 'identifiers', 0],
  ],
  ['an outcome', () => ['outcomes', 0]],
  ['a product', () => ['outcomes', 0, 'products', 0]],
  // The product's measurements hold the "Based on" select and the authentic standard.
  ['a yield measurement', () => ['outcomes', 0, 'products', 0, 'measurements', 0]],
  ['a custom measurement', () => ['outcomes', 0, 'products', 0, 'measurements', 1]],
  [
    'a selectivity measurement',
    () => ['outcomes', 0, 'products', 0, 'measurements', 2],
  ],
  ['an amount measurement', () => ['outcomes', 0, 'products', 0, 'measurements', 3]],
  [
    'an analysis',
    data => ['outcomes', 0, 'analyses', Object.keys(data.outcomes[0].analyses)[0]],
  ],
  ['the conditions', () => ['conditions']],
  ['the setup', () => ['setup']],
  ['the notes', () => ['notes']],
  ['the provenance', () => ['provenance']],
  ['an identifier', () => ['identifiers', 0]],
  ['an observation', () => ['observations', 0]],
  ['a workup', () => ['workups', 0]],
  ['a workup input', () => ['workups', 0, 'input']],
  ['a workup input component', () => ['workups', 0, 'input', 'components', 0]],
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

/** Buttons a drawer form or its title shows only when the reaction can be edited. */
const EDIT_CONTROLS = [
  'Add component',
  'Add IdentifierVia Look up Name',
  'Add Molblock IdentifierVia Ketcher',
  'Analysis',
  'Analytical Data',
  'Automation code',
  'Crude Component',
  'Feature',
  'I am contributor',
  'I am experimenter',
  'Identifier',
  'Measurement',
  'Paste Chunk',
  'Preparation',
  'Product',
  'Record Modification',
  'Save',
  'Save and Close',
  'Vessel Attachment',
  'Vessel Preparation',
];

/** The drawer's title, where the Delete icon lives, above the form. */
function DrawerAt({
  pathComponents,
}: Readonly<{ pathComponents: ReactionPathComponents }>) {
  const sidebarInfo = getSidebarInfo([...pathComponents].reverse());
  const Title = sidebarInfo.sidebarTitle;
  return (
    <nodeToComponentContext.Provider value={reactionNodeToComponent}>
      <Title pathComponents={pathComponents} />
      <ReactionEntityForm
        reactionPathComponents={pathComponents}
        sidebarInfo={sidebarInfo}
        isHidden={false}
        onFormClose={() => undefined}
        onSetFormDirty={() => undefined}
      />
    </nodeToComponentContext.Provider>
  );
}

/** A provider with no actions, over a static source, as a host that only shows reactions. */
function readOnlyWrapper(snapshot: ReactionSnapshot) {
  const source = createStaticReactionSource(snapshot);
  return function ReadOnlyWrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <Provider store={makeContractStore()}>
        <MantineProvider>
          <ReactionProvider
            reactionId={1}
            source={source}
            slots={EMPTY_SLOTS}
          >
            {children}
          </ReactionProvider>
        </MantineProvider>
      </Provider>
    );
  };
}

describe('a read-only drawer', () => {
  it.each(FORMS)('shows no edit control on %s', (_name, pathTo) => {
    const snapshot = fullReactionSnapshot();
    const { queryAllByRole } = render(
      <DrawerAt pathComponents={pathTo(snapshot.data)} />,
      {
        wrapper: readOnlyWrapper(snapshot),
      },
    );
    const labels = queryAllByRole('button').map(button =>
      (button.getAttribute('aria-label') ?? button.textContent ?? '').trim(),
    );
    expect(
      labels.filter(
        label => EDIT_CONTROLS.includes(label) || label.startsWith('Remove '),
      ),
    ).toEqual([]);
  });
});
