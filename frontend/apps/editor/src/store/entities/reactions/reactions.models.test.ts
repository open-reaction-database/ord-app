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
  allowedNodeEntityNames,
  ordToReactionConvertersByNodeEntity,
  reactionToOrdConvertersByNodeEntity,
} from './reactions.models.ts';
import { ReactionNodeEntity } from './reactions.types.ts';
import {
  ordVesselAttachmentToReaction,
  ordVesselPreparationToReaction,
} from './reactionSetup/reactionSetup.converter.ts';

describe('node-entity converter registries', () => {
  const entities = Object.values(ReactionNodeEntity);

  it('exposes an ord->reaction and reaction->ord converter for every node entity', () => {
    for (const entity of entities) {
      // ord->reaction entries wrap the converter in { hasName, convert }; reaction->ord entries are bare functions.
      expect(
        ordToReactionConvertersByNodeEntity[entity].convert,
        `ord->reaction convert for ${entity}`,
      ).toBeTypeOf('function');
      expect(
        reactionToOrdConvertersByNodeEntity[entity],
        `reaction->ord for ${entity}`,
      ).toBeTypeOf('function');
    }
  });

  it('wires vessel attachments and preparations to their own distinct ord->reaction converters', () => {
    // Guards against the copy-paste that pointed VesselAttachments at the preparation converter.
    expect(
      ordToReactionConvertersByNodeEntity[ReactionNodeEntity.VesselAttachments].convert,
    ).toBe(ordVesselAttachmentToReaction);
    expect(
      ordToReactionConvertersByNodeEntity[ReactionNodeEntity.VesselPreparations]
        .convert,
    ).toBe(ordVesselPreparationToReaction);
  });

  it('lists every node entity among the allowed entity names', () => {
    for (const entity of entities) {
      expect(allowedNodeEntityNames).toContain(entity);
    }
  });
});
