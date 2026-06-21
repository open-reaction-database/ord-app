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
  ordTemperatureMeasurementToReaction,
  reactionTemperatureMeasurementToOrd,
  ordPressureMeasurementToReaction,
  reactionPressureMeasurementToOrd,
  ordTemperatureConditionToReaction,
  ordStirringConditionToReaction,
  reactionStirringConditionToOrd,
} from './reactionConditions.converter.ts';

describe('temperature measurement converters', () => {
  it('assigns an id, maps the type to a name, and carries details', () => {
    const result = ordTemperatureMeasurementToReaction({
      type: undefined,
      details: 'thermocouple',
    });
    expect(typeof result.id).toBe('string');
    expect(typeof result.type).toBe('string');
    expect(result.details).toBe('thermocouple');
    expect(result.temperature).toBeTypeOf('object');
    expect(result.time).toBeTypeOf('object');
  });

  it('maps a measurement back to ord with a numeric type', () => {
    const reaction = ordTemperatureMeasurementToReaction({ details: 'probe' });
    const ord = reactionTemperatureMeasurementToOrd(reaction);
    expect(typeof ord.type).toBe('number');
    expect(ord.details).toBe('probe');
  });
});

describe('pressure measurement converters', () => {
  it('round-trips type/details through ord', () => {
    const reaction = ordPressureMeasurementToReaction({
      type: undefined,
      details: 'gauge',
    });
    expect(typeof reaction.id).toBe('string');
    const ord = reactionPressureMeasurementToOrd(reaction);
    expect(typeof ord.type).toBe('number');
    expect(ord.details).toBe('gauge');
  });
});

describe('ordTemperatureConditionToReaction', () => {
  it('defaults the measurements list to an empty array and fills control/setpoint', () => {
    const result = ordTemperatureConditionToReaction(null);
    expect(result.temperatureMeasurements).toEqual([]);
    expect(result.control).toBeTypeOf('object');
    expect(result.setpoint).toBeTypeOf('object');
  });
});

describe('stirring condition converters', () => {
  it('maps type/details/rate from ord', () => {
    const result = ordStirringConditionToReaction({ details: 'magnetic bar' });
    expect(typeof result.type).toBe('string');
    expect(result.details).toBe('magnetic bar');
    expect(result.rate).toBeTypeOf('object');
  });

  it('collapses an empty, unspecified-type stirring condition to null', () => {
    const empty = ordStirringConditionToReaction(null);
    expect(reactionStirringConditionToOrd(empty)).toBeNull();
  });
});
