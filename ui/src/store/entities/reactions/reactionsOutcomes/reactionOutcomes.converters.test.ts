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
import { ordAnalysisToReaction, reactionAnalysisToOrd } from './reactionOutcomes.converters.ts';
import { ReactionBoolean } from '../reactionEntity/reactionEntity.types.ts';

describe('ordAnalysisToReaction', () => {
  it('assigns an id/name and unwraps instrumentLastCalibrated + isOfIsolatedSpecies', () => {
    const result = ordAnalysisToReaction(
      { isOfIsolatedSpecies: true, instrumentLastCalibrated: { value: '2024-01-01' }, data: {}, details: 'NMR run' },
      'NMR',
    );
    expect(typeof result.id).toBe('string');
    expect(result.name).toBe('NMR');
    expect(result.isOfIsolatedSpecies).toBe(ReactionBoolean.True);
    expect(result.instrumentLastCalibrated).toBe('2024-01-01');
    expect(result.details).toBe('NMR run');
    expect(result.analysisData).toEqual({});
  });

  it('defaults a missing instrumentLastCalibrated to null', () => {
    expect(ordAnalysisToReaction({}, 'IR').instrumentLastCalibrated).toBeNull();
  });
});

describe('reactionAnalysisToOrd', () => {
  it('strips id/name and re-wraps instrumentLastCalibrated as a DateTime', () => {
    const analysis = ordAnalysisToReaction(
      { isOfIsolatedSpecies: true, instrumentLastCalibrated: { value: '2024-01-01' }, details: 'd' },
      'NMR',
    );
    const result = reactionAnalysisToOrd(analysis);
    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('name');
    expect(result.instrumentLastCalibrated).toEqual({ value: '2024-01-01' });
    expect(result.isOfIsolatedSpecies).toBe(true);
    expect(result.details).toBe('d');
  });

  it('emits a null instrumentLastCalibrated when unset', () => {
    const analysis = ordAnalysisToReaction({}, 'IR');
    expect(reactionAnalysisToOrd(analysis).instrumentLastCalibrated).toBeNull();
  });
});
