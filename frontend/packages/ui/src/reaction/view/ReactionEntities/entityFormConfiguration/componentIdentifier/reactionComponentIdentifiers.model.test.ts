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
import { ReactionFormNodeType } from '#reaction/view/ReactionEntities/reactionEntities.types.ts';
import { reactionComponentIdentifiers } from './reactionComponentIdentifiers.model.ts';

function typeOptions() {
  const node = reactionComponentIdentifiers.find(
    item => item.type === ReactionFormNodeType.select && item.name === 'type',
  );
  if (node?.type !== ReactionFormNodeType.select) {
    throw new Error('no type select');
  }
  return node.options;
}

describe('reactionComponentIdentifiers', () => {
  it.each(['MOLBLOCK', 'CXSMILES'])(
    'shows %s only as the label of an existing value',
    type => {
      expect(typeOptions()).toContainEqual({
        label: type,
        value: type,
        disabled: true,
      });
      expect(typeOptions()).not.toContain(type);
    },
  );

  it('offers SMILES as a typed identifier', () => {
    expect(typeOptions()).toContain('SMILES');
  });
});
