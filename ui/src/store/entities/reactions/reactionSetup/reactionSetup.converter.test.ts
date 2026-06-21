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
  ordVesselAttachmentToReaction,
  reactionVesselAttachmentToOrd,
  ordVesselPreparationToReaction,
  reactionVesselPreparationToOrd,
  ordVesselSetupToReaction,
  ordSetupToReactionSetup,
} from './reactionSetup.converter.ts';
import { ReactionBoolean } from '../reactionEntity/reactionEntity.types.ts';

describe('vessel attachment converters', () => {
  it('assigns an id and maps the type to a name, then back to a number', () => {
    const reaction = ordVesselAttachmentToReaction({
      type: undefined,
      details: 'reflux condenser',
    });
    expect(typeof reaction.id).toBe('string');
    expect(reaction.details).toBe('reflux condenser');
    expect(typeof reaction.type).toBe('string');

    const ord = reactionVesselAttachmentToOrd(reaction);
    expect(typeof ord.type).toBe('number');
    expect(ord.details).toBe('reflux condenser');
  });
});

describe('vessel preparation converters', () => {
  it('round-trips type and details', () => {
    const reaction = ordVesselPreparationToReaction({
      type: undefined,
      details: 'oven dried',
    });
    expect(typeof reaction.id).toBe('string');
    expect(reaction.details).toBe('oven dried');

    const ord = reactionVesselPreparationToOrd(reaction);
    expect(typeof ord.type).toBe('number');
    expect(ord.details).toBe('oven dried');
  });
});

describe('ordVesselSetupToReaction', () => {
  it('defaults preparation/attachment lists to empty arrays for an empty vessel', () => {
    const vessel = ordVesselSetupToReaction(null);
    expect(vessel.vesselPreparations).toEqual([]);
    expect(vessel.vesselAttachments).toEqual([]);
    expect(typeof vessel.type).toBe('string');
  });
});

describe('ordSetupToReactionSetup', () => {
  it('assigns an id and supplies defaults for an empty setup', () => {
    const setup = ordSetupToReactionSetup(null);
    // withId adds the app-only id at runtime even though ReactionSetup doesn't surface it in its type.
    expect(setup).toHaveProperty('id', expect.any(String));
    expect(setup.isAutomated).toBe(ReactionBoolean.Unspecified);
    expect(setup.automationCode).toEqual({});
    expect(setup.vessel).toBeTypeOf('object');
    expect(setup.environment).toBeTypeOf('object');
  });
});
