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
import { highlightNameMatch } from './highlightNameMatch.ts';

describe('highlightNameMatch', () => {
  it('returns plain text for an empty or whitespace-only query', () => {
    expect(highlightNameMatch('Benzaldehyde', '')).toEqual({
      kind: 'plain',
      text: 'Benzaldehyde',
    });
    expect(highlightNameMatch('Benzaldehyde', '   ')).toEqual({
      kind: 'plain',
      text: 'Benzaldehyde',
    });
  });

  it('highlights the first case-insensitive match and preserves original casing', () => {
    expect(highlightNameMatch('Benzaldehyde coupling', 'benz')).toEqual({
      kind: 'hit',
      before: '',
      match: 'Benz',
      after: 'aldehyde coupling',
    });
  });

  it('returns plain text when there is no match', () => {
    expect(highlightNameMatch('amide formation', 'benz')).toEqual({
      kind: 'plain',
      text: 'amide formation',
    });
  });

  it('highlights matches at the start, middle, and end', () => {
    expect(highlightNameMatch('abc', 'a')).toEqual({
      kind: 'hit',
      before: '',
      match: 'a',
      after: 'bc',
    });
    expect(highlightNameMatch('abc', 'b')).toEqual({
      kind: 'hit',
      before: 'a',
      match: 'b',
      after: 'c',
    });
    expect(highlightNameMatch('abc', 'c')).toEqual({
      kind: 'hit',
      before: 'ab',
      match: 'c',
      after: '',
    });
  });

  it('handles empty or non-string names without throwing', () => {
    expect(highlightNameMatch('', 'x')).toEqual({ kind: 'plain', text: '' });
    expect(highlightNameMatch(undefined as unknown as string, 'x')).toEqual({
      kind: 'plain',
      text: '',
    });
  });

  it('handles a non-string query without throwing', () => {
    expect(highlightNameMatch('Benzaldehyde', null as unknown as string)).toEqual({
      kind: 'plain',
      text: 'Benzaldehyde',
    });
  });

  it('bails to plain text when toLowerCase changes string length', () => {
    // Latin capital I with dot above: lowercasing can produce a combining sequence
    // whose length differs from the original, which would corrupt slice offsets.
    const name = 'İstanbul';
    if (name.toLowerCase().length === name.length) {
      // Engine preserves length — skip asserting the bail path.
      return;
    }
    expect(highlightNameMatch(name, 'İ')).toEqual({
      kind: 'plain',
      text: name,
    });
  });
});
