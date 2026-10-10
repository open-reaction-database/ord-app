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
import { create } from '@bufbuild/protobuf';
import {
  PersonSchema,
  ReactionProvenanceSchema,
  RecordEventSchema,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import {
  ordPersonToReactionPerson,
  reactionPersonToOrdPerson,
  ordRecordEventToReaction,
  reactionRecordEventToOrd,
  ordProvenanceToReaction,
  reactionProvenanceToOrd,
} from './reactionProvenance.converters.ts';

describe('person converters', () => {
  it('substitutes an empty person for nullish input', () => {
    expect(ordPersonToReactionPerson(null)).toEqual({});
    expect(ordPersonToReactionPerson(undefined)).toEqual({});
  });

  it('carries a person through in both directions, leaving unset fields undefined', () => {
    const person = ordPersonToReactionPerson(
      create(PersonSchema, { name: 'Ada Lovelace', orcid: '0000' }),
    );
    expect(person).toEqual({ name: 'Ada Lovelace', orcid: '0000' });
    expect(person.email).toBeUndefined();
    expect(reactionPersonToOrdPerson(person)).toEqual({
      name: 'Ada Lovelace',
      orcid: '0000',
    });
  });
});

describe('record event converters', () => {
  it('builds an id-bearing record event with defaults for empty input', () => {
    const result = ordRecordEventToReaction(null);
    expect(typeof result.id).toBe('string');
    expect(result.time).toBeNull();
    expect(result.person).toBeTypeOf('object');
  });

  it('carries details and a person, and formats a present time', () => {
    const result = ordRecordEventToReaction(
      create(RecordEventSchema, {
        details: 'created',
        time: { value: '2024-06-01T12:00:00' },
        person: { name: 'Grace Hopper' },
      }),
    );
    expect(result.details).toBe('created');
    expect(result.person.name).toBe('Grace Hopper');
    expect(result.time).toBeTruthy();
  });

  it('maps a record event back to ord shape, dropping a null time', () => {
    const result = reactionRecordEventToOrd({
      id: 'x',
      time: null,
      details: 'edited',
      person: { name: 'Ada' },
    });
    expect(result.time).toBeUndefined();
    expect(result.details).toBe('edited');
    expect(result.person).toEqual({ name: 'Ada' });
  });
});

describe('provenance converters', () => {
  it('builds a default provenance with an id and empty recordModified list', () => {
    const result = ordProvenanceToReaction(null);
    expect(typeof result.id).toBe('string');
    expect(result.recordModified).toEqual([]);
    expect(typeof result.recordCreated.id).toBe('string');
    expect(result.experimentStart).toBeNull();
  });

  it('strips the id and maps nested events when converting back to ord', () => {
    const provenance = ordProvenanceToReaction(null);
    const result = reactionProvenanceToOrd(provenance);
    expect(result).not.toHaveProperty('id');
    expect(result.recordModified).toEqual([]);
    expect(result.recordCreated).toBeDefined();
    expect(result.experimentStart).toBeUndefined();
  });

  it('carries the fields the app does not edit through a round trip', () => {
    const ordProvenance = create(ReactionProvenanceSchema, {
      doi: '10.1000/xyz',
      isMined: true,
      reactionMetadata: { source: { kind: { case: 'stringValue', value: 'scraped' } } },
    });
    const result = create(
      ReactionProvenanceSchema,
      reactionProvenanceToOrd(ordProvenanceToReaction(ordProvenance)),
    );
    expect(result.doi).toBe('10.1000/xyz');
    expect(result.isMined).toBe(true);
    expect(result.reactionMetadata.source.kind).toEqual({
      case: 'stringValue',
      value: 'scraped',
    });
  });
});
