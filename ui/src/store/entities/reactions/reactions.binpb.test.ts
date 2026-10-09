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
import { findNonSerializableValue } from '@reduxjs/toolkit';
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

  it('decodes to a serializable app reaction without protobuf-es messages', () => {
    const appReaction = ordBinpbToReaction(toBinpb(fullReaction));
    expect(findNonSerializableValue(appReaction)).toBe(false);
    expect(JSON.stringify(appReaction)).not.toContain('$typeName');
  });

  it('truncates a decimal that a template variable put in an int32 field', () => {
    const appReaction = ordBinpbToReaction(toBinpb(fullReaction));
    const [input] = Object.values(appReaction.inputs);
    const [analysis] = Object.values(appReaction.outcomes[0].analyses);
    input.additionOrder = 1.5;
    appReaction.conditions.stirring.rate.rpm = 800.7;
    analysis.chmoId = 1234.2;
    const ordReaction = fromBinpb(reactionToOrdBinpb(appReaction));
    expect(ordReaction.inputs.ethanol.additionOrder).toBe(1);
    expect(ordReaction.conditions?.stirring?.rate?.rpm).toBe(800);
    expect(ordReaction.outcomes[0].analyses.nmr.chmoId).toBe(1234);
  });
});
