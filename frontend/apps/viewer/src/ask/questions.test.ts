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
  askPath,
  MOST_STRUCTURES,
  nextPlaceholder,
  readStructures,
  withoutPlaceholder,
  withPlaceholder,
} from '#ask/questions.ts';

describe('questions', () => {
  it('hands out the first name no structure holds, up to the backend bound', () => {
    expect(nextPlaceholder({})).toBe('@A');
    expect(nextPlaceholder({ '@A': 'C', '@C': 'N' })).toBe('@B');
    const full = Object.fromEntries(
      Array.from({ length: MOST_STRUCTURES }, (_, index) => [
        `@${String.fromCodePoint(65 + index)}`,
        'C',
      ]),
    );
    expect(nextPlaceholder(full)).toBeUndefined();
  });

  it('carries each structure in the address, and reads back only placeholders', () => {
    const path = askPath('reactions that make @A from @B', {
      '@A': 'c1ccccc1',
      '@B': 'C(=O)O',
    });
    expect(path).toBe(
      '/ask#q=reactions+that+make+%40A+from+%40B&%40A=c1ccccc1&%40B=C%28%3DO%29O',
    );
    const params = new URLSearchParams(path.split('#')[1]);
    params.append('page', '2');
    params.append('@lower', 'C');
    expect(readStructures(params)).toEqual({ '@A': 'c1ccccc1', '@B': 'C(=O)O' });
  });

  it('writes a placeholder at the end of a question', () => {
    expect(withPlaceholder('reactions that make ', '@A')).toBe(
      'reactions that make @A',
    );
    expect(withPlaceholder('', '@A')).toBe('@A');
  });

  it('removes a placeholder only where it stands alone', () => {
    expect(withoutPlaceholder('reactions that make @A from @AB', '@A')).toBe(
      'reactions that make from @AB',
    );
    expect(withoutPlaceholder('@A with C[C@@H](N)O, ask user@A.org', '@A')).toBe(
      'with C[C@@H](N)O, ask user@A.org',
    );
  });
});
