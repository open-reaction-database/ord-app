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
import { ordNotesToReaction, reactionNotesToOrd } from './reactionNotes.converters.ts';
import { ReactionBoolean } from '../reactionEntity/reactionEntity.types.ts';
import type { ReactionNotes } from './reactionNotes.types.ts';

const unspecifiedNotes: ReactionNotes = {
  isHeterogeneous: ReactionBoolean.Unspecified,
  formsPrecipitate: ReactionBoolean.Unspecified,
  isExothermic: ReactionBoolean.Unspecified,
  offgasses: ReactionBoolean.Unspecified,
  isSensitiveToMoisture: ReactionBoolean.Unspecified,
  isSensitiveToOxygen: ReactionBoolean.Unspecified,
  isSensitiveToLight: ReactionBoolean.Unspecified,
};

describe('ordNotesToReaction', () => {
  it('defaults every flag to Unspecified for empty input', () => {
    expect(ordNotesToReaction(null)).toEqual(unspecifiedNotes);
  });

  it('maps ord booleans to the tri-state enum and passes other fields through', () => {
    const result = ordNotesToReaction({
      isHeterogeneous: true,
      isExothermic: false,
      procedureDetails: 'stir overnight',
    });
    expect(result.isHeterogeneous).toBe(ReactionBoolean.True);
    expect(result.isExothermic).toBe(ReactionBoolean.False);
    expect(result.offgasses).toBe(ReactionBoolean.Unspecified);
    expect(result.procedureDetails).toBe('stir overnight');
  });
});

describe('reactionNotesToOrd', () => {
  it('collapses an all-unspecified, empty-text notes object to null', () => {
    expect(reactionNotesToOrd(unspecifiedNotes)).toBeNull();
  });

  it('maps the tri-state enum back to ord booleans (null for Unspecified)', () => {
    const result = reactionNotesToOrd({
      ...unspecifiedNotes,
      isExothermic: ReactionBoolean.True,
      offgasses: ReactionBoolean.False,
    });
    expect(result).toMatchObject({
      isExothermic: true,
      offgasses: false,
      isHeterogeneous: null,
    });
  });

  it('keeps the object when only free-text fields are set', () => {
    const result = reactionNotesToOrd({
      ...unspecifiedNotes,
      safetyNotes: 'handle with care',
    });
    expect(result?.safetyNotes).toBe('handle with care');
  });
});
