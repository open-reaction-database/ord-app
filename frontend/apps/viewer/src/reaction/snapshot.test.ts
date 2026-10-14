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
import { describe, expect, it } from 'vitest';
import { recordToSnapshot } from '#reaction/snapshot.ts';
import { VIEWER0101 } from '#test/fixtures/records.ts';

describe('recordToSnapshot', () => {
  it('decodes the reaction and names it by its ORD ID', () => {
    const snapshot = recordToSnapshot(VIEWER0101);
    const inputs = Object.values(snapshot.data.inputs);
    expect(snapshot.pb_reaction_id).toBe('ord-viewer0101');
    expect(inputs.map(input => input.name)).toEqual(['reactants']);
    expect(inputs[0].components).toHaveLength(2);
    expect(snapshot.data.outcomes[0].products).toHaveLength(1);
  });

  it('keys each molblock by the component it draws', () => {
    const snapshot = recordToSnapshot(VIEWER0101);
    const [reactants] = Object.values(snapshot.data.inputs);
    const ids = [
      ...reactants.components.map(component => component.id),
      snapshot.data.outcomes[0].products[0].id,
    ];
    for (const id of ids) {
      expect(snapshot.previews[id]).toMatch(/M {2}END/);
    }
  });

  it('carries an empty summary and no validity, as a record has neither', () => {
    const snapshot = recordToSnapshot(VIEWER0101);
    expect(snapshot.summary).toEqual({ provenance: {}, summary: {}, conditions: '' });
    expect(snapshot.is_valid).toBeUndefined();
  });
});
