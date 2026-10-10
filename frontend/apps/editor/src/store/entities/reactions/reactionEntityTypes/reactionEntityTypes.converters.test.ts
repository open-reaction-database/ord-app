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
import type { DescEnum } from '@bufbuild/protobuf';
import * as ordSchema from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import {
  ReactionRole_ReactionRoleType,
  Time_TimeUnit,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import {
  ordReactionRoleToReaction,
  reactionReactionRoleToOrd,
  ordTimeTypeToReaction,
  reactionTimeTypeToOrd,
} from './reactionEntityTypes.converters.ts';

// The first enum member with a non-zero numeric value (i.e. not UNSPECIFIED).
const firstNonZeroValue = (enumObject: Record<string, unknown>): number => {
  const value = Object.values(enumObject).find(
    (value): value is number => typeof value === 'number' && value !== 0,
  );
  if (value === undefined) {
    throw new Error('expected the enum to have a non-zero numeric member');
  }
  return value;
};

describe('generated entity-type converters', () => {
  it('round-trips a known ord value through its name (reaction role)', () => {
    const value = firstNonZeroValue(ReactionRole_ReactionRoleType);
    const name = ordReactionRoleToReaction(value);
    expect(typeof name).toBe('string');
    expect(reactionReactionRoleToOrd(name)).toBe(value);
  });

  it('treats null and undefined as the value-0 (unspecified) type', () => {
    const unspecified = ordReactionRoleToReaction(0);
    expect(ordReactionRoleToReaction(null)).toBe(unspecified);
    expect(ordReactionRoleToReaction(undefined)).toBe(unspecified);
  });

  it('applies the same factory behavior to another converter (time unit)', () => {
    const value = firstNonZeroValue(Time_TimeUnit);
    const name = ordTimeTypeToReaction(value);
    expect(reactionTimeTypeToOrd(name)).toBe(value);
    expect(ordTimeTypeToReaction(undefined)).toBe(ordTimeTypeToReaction(0));
  });

  // The store reads value names from the enum descriptors, and writes look them up in the
  // generated TypeScript enums, which use local names. The two must be the same.
  it('names each enum value as the generated TypeScript enum does', () => {
    const enumSchemas = Object.values(ordSchema as Record<string, unknown>).filter(
      (value): value is DescEnum => (value as Partial<DescEnum>).kind === 'enum',
    );
    expect(enumSchemas.length).toBeGreaterThan(0);
    for (const { typeName, values } of enumSchemas) {
      for (const { name, localName } of values) {
        expect(`${typeName}.${localName}`).toBe(`${typeName}.${name}`);
      }
    }
  });
});
