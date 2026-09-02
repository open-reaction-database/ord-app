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
import { replaceNameIdInReactionComponentPath } from './replaceNameIdInReactionComponentPath.ts';
import type { AppReaction } from '../entities/reactions/reactions.types.ts';

const reactionWithInput = {
  inputs: { 'uuid-1': { id: 'i1', name: 'reagent' } },
} as unknown as AppReaction;

describe('replaceNameIdInReactionComponentPath', () => {
  it('leaves a path without map keys or condition measurements unchanged', () => {
    expect(
      replaceNameIdInReactionComponentPath(
        ['setup', 'vessel'],
        {} as AppReaction,
        'id',
      ),
    ).toEqual(['setup', 'vessel']);
  });

  it('replaces an input name with its id when resolving to id', () => {
    expect(
      replaceNameIdInReactionComponentPath(
        ['inputs', 'reagent'],
        reactionWithInput,
        'id',
      ),
    ).toEqual(['inputs', 'i1']);
  });

  it('replaces an input id with its name when resolving to name', () => {
    expect(
      replaceNameIdInReactionComponentPath(['inputs', 'i1'], reactionWithInput, 'name'),
    ).toEqual(['inputs', 'reagent']);
  });

  it('throws when the referenced input is not present in the reaction map', () => {
    // findEntityByName uses a non-null assertion, so a missing key throws on the subsequent access.
    expect(() =>
      replaceNameIdInReactionComponentPath(
        ['inputs', 'missing-key'],
        reactionWithInput,
        'id',
      ),
    ).toThrow();
  });

  it('rewrites a condition `measurements` segment to its prefixed form and back', () => {
    expect(
      replaceNameIdInReactionComponentPath(
        ['temperature', 'measurements'],
        {} as AppReaction,
        'id',
      ),
    ).toEqual(['temperature', 'temperatureMeasurements']);
    expect(
      replaceNameIdInReactionComponentPath(
        ['temperature', 'temperatureMeasurements'],
        {} as AppReaction,
        'name',
      ),
    ).toEqual(['temperature', 'measurements']);
  });

  it('maps reactionMetadata names to ids and back', () => {
    const reaction = {
      provenance: {
        reactionMetadata: {
          'uuid-m': { id: 'uuid-m', name: 'project_id' },
        },
      },
    } as unknown as AppReaction;
    expect(
      replaceNameIdInReactionComponentPath(
        ['provenance', 'reactionMetadata', 'project_id'],
        reaction,
        'id',
      ),
    ).toEqual(['provenance', 'reactionMetadata', 'uuid-m']);
    expect(
      replaceNameIdInReactionComponentPath(
        ['provenance', 'reactionMetadata', 'uuid-m'],
        reaction,
        'name',
      ),
    ).toEqual(['provenance', 'reactionMetadata', 'project_id']);
  });
});
