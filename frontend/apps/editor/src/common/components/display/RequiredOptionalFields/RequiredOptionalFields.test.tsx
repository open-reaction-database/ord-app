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
import { screen } from '@testing-library/react';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { RequiredOptionalFields } from './RequiredOptionalFields.tsx';

interface Entity {
  name: string;
  note: string;
}

describe('RequiredOptionalFields', () => {
  it('always renders required fields and omits optional fields with empty values', () => {
    const entity: Entity = { name: 'Acetone', note: '' };
    renderWithMantine(
      <RequiredOptionalFields<Entity>
        entity={entity}
        requiredFields={[{ label: 'Name', render: e => e.name }]}
        optionalFields={[{ label: 'Note', render: e => e.note }]}
      />,
    );
    expect(screen.getByText('Name:')).toBeInTheDocument();
    expect(screen.getByText('Acetone')).toBeInTheDocument();
    expect(screen.queryByText('Note:')).toBeNull();
  });

  it('renders optional fields when they have a value', () => {
    const entity: Entity = { name: 'Acetone', note: 'flammable' };
    renderWithMantine(
      <RequiredOptionalFields<Entity>
        entity={entity}
        requiredFields={[{ label: 'Name', render: e => e.name }]}
        optionalFields={[{ label: 'Note', render: e => e.note }]}
      />,
    );
    expect(screen.getByText('Note:')).toBeInTheDocument();
    expect(screen.getByText('flammable')).toBeInTheDocument();
  });
});
