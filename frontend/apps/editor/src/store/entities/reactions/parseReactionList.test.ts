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
import { describe, it, expect } from 'vitest';
import type { Pages } from 'common/types/pages.ts';
import type { ReactionResponse } from 'store/entities/reactions/reactions.types.ts';
import { parseReactionList } from './parseReactionList.ts';

// An empty binpb decodes to the app's default reaction, so parseReaction runs unstubbed.
const reactionResponse = (id: number) =>
  ({
    id,
    pb_reaction_id: `rx${id}`,
    is_valid: true,
    summary: {},
    binpb: '',
    molblocks: { inputs: {}, outcomes: [], workups: [] },
    validation: null,
  }) as unknown as ReactionResponse;

describe('parseReactionList', () => {
  it('maps every item through parseReaction in order while preserving pagination', () => {
    const pages = {
      page: 1,
      size: 10,
      total: 2,
      items: [reactionResponse(1), reactionResponse(2)],
    } as unknown as Pages<ReactionResponse>;

    const result = parseReactionList(pages);
    expect(result.page).toBe(1);
    expect(result.total).toBe(2);
    expect(result.items.map(item => item.id)).toEqual([1, 2]);
    expect(result.items.map(item => item.pb_reaction_id)).toEqual(['rx1', 'rx2']);
    expect(result.items[0].previews).toEqual({});
  });
});
