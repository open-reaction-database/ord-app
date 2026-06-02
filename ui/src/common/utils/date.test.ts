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
import { convertUtcDateToUserTZ, convertUserTZDateToUtc, formatUtcDateToDisplay, formatDateToDisplay } from './date.ts';

// DATE_TIME_HUMAN_FORMAT renders as e.g. "01.06.2024 02:00 pm" (DD.MM.YYYY hh:mm a).
const humanFormat = /^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2} (am|pm)$/;

// These assert timezone-independent invariants (instant + UTC offset) so they stay meaningful on a
// UTC CI runner, where a wall-clock round trip through the guessed zone would pass vacuously.
describe('timezone conversions', () => {
  it('parses a UTC string without moving the instant', () => {
    const iso = '2024-06-01T12:00:00Z';
    expect(convertUtcDateToUserTZ(iso).valueOf()).toBe(Date.parse(iso));
  });

  it('converts an absolute Date to a UTC-mode value at the same instant', () => {
    const date = new Date('2024-06-01T12:00:00Z');
    const utc = convertUserTZDateToUtc(date);
    expect(utc.valueOf()).toBe(date.getTime());
    expect(utc.utcOffset()).toBe(0);
  });
});

describe('display formatting', () => {
  it('formats a UTC date with the human-readable format', () => {
    expect(formatUtcDateToDisplay('2024-06-01T12:00:00Z')).toMatch(humanFormat);
  });

  it('formats a local date/Date with the human-readable format', () => {
    expect(formatDateToDisplay('2024-06-01T12:00:00')).toMatch(humanFormat);
    expect(formatDateToDisplay(new Date('2024-06-01T12:00:00'))).toMatch(humanFormat);
  });
});
