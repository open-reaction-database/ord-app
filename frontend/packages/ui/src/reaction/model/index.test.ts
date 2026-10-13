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
import {
  ordToReactionConvertersByNodeEntity,
  reactionToOrdConvertersByNodeEntity,
} from './index.ts';

// The barrel evaluates its modules in export order. A cycle among them would let a converter
// map read a converter before its module had run, leaving that entry undefined.
describe('the model barrel', () => {
  it('builds every converter map entry', () => {
    for (const converter of Object.values(reactionToOrdConvertersByNodeEntity)) {
      expect(converter).toBeTypeOf('function');
    }
    for (const converter of Object.values(ordToReactionConvertersByNodeEntity)) {
      expect(converter.convert).toBeTypeOf('function');
    }
  });
});
