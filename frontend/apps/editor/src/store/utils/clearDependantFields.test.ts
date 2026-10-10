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
import { describe, it, expect } from 'vitest';
import { clearDependantFields } from './clearDependantFields.ts';

interface Sample {
  keep: string | null;
  dependant: string | null;
}

describe('clearDependantFields', () => {
  it('nulls a field whose predicate is false', () => {
    const result = clearDependantFields<Sample>({ keep: 'v', dependant: 'x' }, [
      ['dependant', () => false],
    ]);
    expect(result).toEqual({ keep: 'v', dependant: null });
  });

  it('leaves a field whose predicate is true', () => {
    const result = clearDependantFields<Sample>({ keep: 'v', dependant: 'x' }, [
      ['dependant', () => true],
    ]);
    expect(result).toEqual({ keep: 'v', dependant: 'x' });
  });

  it('evaluates each predicate against the working copy, not the original', () => {
    // The first rule nulls `keep`; the second rule's predicate must observe that
    // mutation. Were it reading the original object, `dependant` would survive.
    const result = clearDependantFields<Sample>({ keep: 'set', dependant: 'x' }, [
      ['keep', () => false],
      ['dependant', object => object.keep !== null],
    ]);
    expect(result).toEqual({ keep: null, dependant: null });
  });

  it('does not mutate the input object', () => {
    const input: Sample = { keep: 'v', dependant: 'x' };
    clearDependantFields<Sample>(input, [['dependant', () => false]]);
    expect(input.dependant).toBe('x');
  });
});
