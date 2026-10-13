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
import type { Query } from '#api/types.ts';

describe('Query', () => {
  // A type check, which tsc -b runs: each request leaves out a field the backend defaults.
  it('takes requests without the fields the backend defaults', () => {
    const queries = [
      { order_by: [{ key: 'reaction_id' }] },
      { where: { op: 'substructure', path: 'inputs', smarts: 'c1ccccc1' } },
      { where: { op: 'reaction_smarts', smarts: '[C:1]>>[C:1]' } },
    ] satisfies Array<Query>;
    expect(queries).toHaveLength(3);
  });
});
