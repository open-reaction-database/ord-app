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
import { equals, fromBinary, toBinary } from '@bufbuild/protobuf';
import { base64Decode, base64Encode } from '@bufbuild/protobuf/wire';
import {
  ReactionSchema,
  type Reaction,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { fullReaction } from 'test/fullReaction.ts';
import { ordBinpbToReaction, reactionToOrdBinpb } from './reactions.converters.ts';

const toBinpb = (reaction: Reaction) =>
  base64Encode(toBinary(ReactionSchema, reaction));

const fromBinpb = (binpb: string) => fromBinary(ReactionSchema, base64Decode(binpb));

describe('binpb conversion', () => {
  it('keeps every field the app edits through a decode and encode', () => {
    const roundTripped = fromBinpb(
      reactionToOrdBinpb(ordBinpbToReaction(toBinpb(fullReaction))),
    );
    expect(roundTripped).toEqual(fullReaction);
    expect(equals(ReactionSchema, roundTripped, fullReaction)).toBe(true);
  });

  it('decodes oneof members into the app shape', () => {
    const appReaction = ordBinpbToReaction(toBinpb(fullReaction));
    const [input] = Object.values(appReaction.inputs);
    expect(input.components[0].amount).toMatchObject({
      value: 2.5,
      units: 'MILLILITER',
    });
    const measurements = appReaction.outcomes[0].products[0].measurements;
    expect(measurements.map(({ value }) => value?.type)).toEqual([
      '%',
      'Number',
      'String',
      'Mass',
    ]);
  });

  it('decodes an empty reaction to the app defaults', () => {
    const appReaction = ordBinpbToReaction('');
    expect(appReaction.reactionId).toBeUndefined();
    expect(appReaction.inputs).toEqual({});
    expect(appReaction.identifiers).toEqual([]);
    expect(appReaction.notes.procedureDetails).toBeUndefined();
    expect(appReaction.provenance.recordCreated.person).toEqual({});
  });

  it('keeps no protobuf-es message metadata in the app reaction', () => {
    const appReaction = ordBinpbToReaction(toBinpb(fullReaction));
    const { reactionMetadata: _, ...provenance } = appReaction.provenance;
    expect(JSON.stringify({ ...appReaction, provenance })).not.toContain('$typeName');
  });
});
