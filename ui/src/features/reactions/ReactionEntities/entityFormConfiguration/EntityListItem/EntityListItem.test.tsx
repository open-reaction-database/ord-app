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
import { EntityListItem } from './EntityListItem.tsx';

interface Analysis {
  type: string;
}

describe('EntityListItem', () => {
  it('renders a "<title> <key>" heading and the required fields for a string title', () => {
    const { getByText } = renderInReactionView(
      <EntityListItem<Analysis>
        entityKey="a1"
        entity={{ type: 'NMR' }}
        entityField="analyses"
        title="Analysis"
        requiredFields={[{ label: 'Type', render: entity => entity.type }]}
        historyPathComponents={[]}
      />,
      { pathComponents: ['outcomes', 0] },
    );
    expect(getByText('Analysis a1')).toBeInTheDocument();
    expect(getByText('Type:')).toBeInTheDocument();
    expect(getByText('NMR')).toBeInTheDocument();
  });

  it('offsets a numeric key by one for a string title (1-based display)', () => {
    const { getByText } = renderInReactionView(
      <EntityListItem<Analysis>
        entityKey={0}
        entity={{ type: 'NMR' }}
        entityField="analyses"
        title="Measurement"
        requiredFields={[]}
        historyPathComponents={[]}
      />,
      { pathComponents: ['outcomes', 0] },
    );
    expect(getByText('Measurement 1')).toBeInTheDocument();
  });

  it('uses a function title when provided', () => {
    const { getByText } = renderInReactionView(
      <EntityListItem<Analysis>
        entityKey={0}
        entity={{ type: 'HPLC' }}
        entityField="analyses"
        title={entity => `Custom ${entity.type}`}
        requiredFields={[]}
        historyPathComponents={[]}
      />,
      { pathComponents: ['outcomes', 0] },
    );
    expect(getByText('Custom HPLC')).toBeInTheDocument();
  });
});
