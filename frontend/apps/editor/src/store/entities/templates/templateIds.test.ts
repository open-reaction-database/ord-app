/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, expect, it } from 'vitest';
import { templateIdFromNumber, templateNumberFromId } from './templateIds.ts';

describe('template ids', () => {
  it('store the backend’s number as template_<number>', () => {
    expect(templateIdFromNumber(5)).toBe('template_5');
    expect(templateIdFromNumber('5')).toBe('template_5');
  });

  it('read the backend’s number back from a stored id', () => {
    expect(templateNumberFromId('template_5')).toBe(5);
  });
});
