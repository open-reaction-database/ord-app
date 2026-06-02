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
import { ordObservationToReaction, reactionObservationToOrd } from './reactionObservation.converter.ts';
import { AppDataType } from '../reactionData/reactionData.types.ts';

describe('ordObservationToReaction', () => {
  it('assigns an id, the comment, a time, and the named image data', () => {
    const result = ordObservationToReaction({ comment: 'gas evolved', image: { url: 'https://img' } });
    expect(typeof result.id).toBe('string');
    expect(result.comment).toBe('gas evolved');
    expect(result.image.name).toBe('Observation');
    expect(result.image.data).toMatchObject({ type: AppDataType.Url, value: 'https://img' });
    expect(result.time).toBeDefined();
  });

  it('defaults a missing comment to an empty string', () => {
    expect(ordObservationToReaction({}).comment).toBe('');
  });
});

describe('reactionObservationToOrd', () => {
  it('round-trips the comment and image back to ord shape', () => {
    const observation = ordObservationToReaction({ comment: 'precipitate', image: { stringValue: 'note' } });
    const result = reactionObservationToOrd(observation);
    expect(result.comment).toBe('precipitate');
    expect(result.image?.stringValue).toBe('note');
  });
});
