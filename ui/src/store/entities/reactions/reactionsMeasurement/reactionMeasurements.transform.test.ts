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
import { measurementTransform } from './reactionMeasurements.transform.ts';
import type { ReactionMeasurement } from '../reactionComponent/reactionComponent.types.ts';
import type { ReactionMeasurementType } from '../reactionEntityTypes/reactionEntityTypes.types.ts';
import { ReactionBoolean } from '../reactionEntity/reactionEntity.types.ts';

const makeMeasurement = (type: ReactionMeasurementType, usesAuthenticStandard: ReactionBoolean): ReactionMeasurement =>
  ({
    id: 'm1',
    type,
    usesAuthenticStandard,
    authenticStandard: { components: [] },
    retentionTime: { value: 1 },
    selectivity: { value: 2 },
    waveLength: { value: 3 },
    massSpecDetails: { value: 4 },
    value: { type: 'Mass', value: 5 },
  }) as unknown as ReactionMeasurement;

describe('measurementTransform', () => {
  it('keeps only the SELECTIVITY-compatible fields for a SELECTIVITY measurement', () => {
    const result = measurementTransform(makeMeasurement('SELECTIVITY', ReactionBoolean.True));
    expect(result.selectivity).not.toBeNull();
    expect(result.value).not.toBeNull();
    expect(result.authenticStandard).not.toBeNull(); // usesAuthenticStandard === True
    expect(result.retentionTime).toBeNull();
    expect(result.waveLength).toBeNull();
    expect(result.massSpecDetails).toBeNull();
  });

  it('keeps all type-dependent fields for CUSTOM but clears authenticStandard when not used', () => {
    const result = measurementTransform(makeMeasurement('CUSTOM', ReactionBoolean.False));
    expect(result.retentionTime).not.toBeNull();
    expect(result.selectivity).not.toBeNull();
    expect(result.waveLength).not.toBeNull();
    expect(result.massSpecDetails).not.toBeNull();
    expect(result.value).not.toBeNull();
    expect(result.authenticStandard).toBeNull(); // usesAuthenticStandard !== True
  });
});
