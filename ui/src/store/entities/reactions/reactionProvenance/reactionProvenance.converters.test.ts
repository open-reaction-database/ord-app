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
import {
  ordPersonToReactionPerson,
  reactionPersonToOrdPerson,
  ordRecordEventToReaction,
  reactionRecordEventToOrd,
  ordProvenanceToReaction,
  reactionProvenanceToOrd,
} from './reactionProvenance.converters.ts';

describe('person converters', () => {
  it('substitutes an empty Person object for nullish input', () => {
    expect(ordPersonToReactionPerson(null)).toBeTypeOf('object');
    expect(ordPersonToReactionPerson(undefined)).not.toBeNull();
  });

  it('passes an existing person through in both directions', () => {
    const person = { name: 'Ada Lovelace', orcid: '0000' };
    expect(ordPersonToReactionPerson(person)).toBe(person);
    expect(reactionPersonToOrdPerson(person)).toBe(person);
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
    const result = ordRecordEventToReaction({
      details: 'created',
      time: { value: '2024-06-01T12:00:00' },
      person: { name: 'Grace Hopper' },
    });
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
    expect(result.time).toBeNull();
    expect(result.details).toBe('edited');
    expect(result.person).toEqual({ name: 'Ada' });
  });
});

describe('provenance converters', () => {
  it('builds a default provenance with an id, empty recordModified, and empty reactionMetadata', () => {
    const result = ordProvenanceToReaction(null);
    expect(typeof result.id).toBe('string');
    expect(result.recordModified).toEqual([]);
    expect(result.reactionMetadata).toEqual({});
    expect(typeof result.recordCreated.id).toBe('string');
    expect(result.experimentStart).toBeNull();
  });

  it('loads absent reactionMetadata as an empty map', () => {
    const result = ordProvenanceToReaction({ city: 'Boston' });
    expect(result.reactionMetadata).toEqual({});
    expect(result.city).toBe('Boston');
  });

  it('converts a populated reactionMetadata map and preserves isMined', () => {
    const result = ordProvenanceToReaction({
      isMined: true,
      reactionMetadata: {
        project_id: { stringValue: 'ORD-123', description: 'internal id' },
        empty_data: {},
      },
    });
    expect(result.isMined).toBe(true);
    const items = Object.values(result.reactionMetadata);
    expect(items).toHaveLength(2);
    const byName = Object.fromEntries(items.map(item => [item.name, item]));
    expect(byName.project_id.data).toMatchObject({
      type: 'Text',
      value: 'ORD-123',
    });
    expect(byName.project_id.description).toBe('internal id');
    expect(byName.empty_data.data).toMatchObject({ type: 'Number', value: null });
  });

  it('strips the id and maps nested events when converting back to ord', () => {
    const provenance = ordProvenanceToReaction(null);
    const result = reactionProvenanceToOrd(provenance);
    expect(result).not.toHaveProperty('id');
    expect(result.recordModified).toEqual([]);
    expect(result.recordCreated).toBeDefined();
    expect(result.experimentStart).toBeNull();
    expect(result.reactionMetadata).toBeNull();
  });

  it('round-trips reactionMetadata names and values, including empty oneof Data', () => {
    const provenance = ordProvenanceToReaction({
      isMined: false,
      reactionMetadata: {
        note: { stringValue: 'hello' },
        blank: {},
      },
    });
    const ordOut = reactionProvenanceToOrd(provenance);
    expect(ordOut.isMined).toBe(false);
    expect(ordOut.reactionMetadata).toEqual({
      note: expect.objectContaining({ stringValue: 'hello' }),
      blank: expect.objectContaining({}),
    });
    expect(ordOut.reactionMetadata?.blank?.floatValue).toBeUndefined();
    expect(ordOut.reactionMetadata?.blank?.stringValue).toBeUndefined();
  });
});
