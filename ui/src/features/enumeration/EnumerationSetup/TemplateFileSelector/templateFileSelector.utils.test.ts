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
import { guessDelimiter, normalizeCsvText } from './templateFileSelector.utils.ts';

describe('normalizeCsvText', () => {
  it('strips a leading UTF-8 BOM', () => {
    expect(normalizeCsvText('\uFEFFa,b')).toBe('a,b');
  });

  it('returns the content unchanged when there is no BOM', () => {
    expect(normalizeCsvText('a,b')).toBe('a,b');
    expect(normalizeCsvText('')).toBe('');
  });
});

describe('guessDelimiter', () => {
  it('detects a consistent delimiter from the first line', () => {
    expect(guessDelimiter('a,b,c\nd,e,f')).toBe(',');
    expect(guessDelimiter('a\tb\tc\n')).toBe('\t');
    expect(guessDelimiter('a;b;c')).toBe(';');
  });

  it(String.raw`only inspects the first line, stopping at \n or \r`, () => {
    expect(guessDelimiter('a|b|c\nx,y,z')).toBe('|');
    expect(guessDelimiter('a|b|c\rx,y,z')).toBe('|');
  });

  it('falls back to the default (";") when the first line has no delimiters', () => {
    expect(guessDelimiter('')).toBe(';');
    expect(guessDelimiter('abc\n')).toBe(';');
  });

  it('falls back to the default when the first line mixes different delimiters', () => {
    expect(guessDelimiter('a,b;c\n')).toBe(';');
  });

  it('detects comma for underscore and hyphen header names', () => {
    expect(guessDelimiter('alcohol_smiles,product_yield\n')).toBe(',');
    expect(guessDelimiter('col-a,col-b\n')).toBe(',');
  });

  it('detects semicolon for underscore header names', () => {
    expect(guessDelimiter('alcohol_smiles;product_yield\n')).toBe(';');
  });

  it('ignores spaces and quotes when detecting delimiters', () => {
    expect(guessDelimiter('first name,last name\n')).toBe(',');
    expect(guessDelimiter('"a","b"\n')).toBe(',');
  });

  it('ignores supported delimiters inside quoted header fields', () => {
    expect(guessDelimiter('"temperature; corrected",yield\n')).toBe(',');
    expect(guessDelimiter('"a,b";c\n')).toBe(';');
    expect(guessDelimiter('"say ""hi; there""",next\n')).toBe(',');
  });

  it('continues past newlines inside quoted header fields', () => {
    expect(guessDelimiter('"multi\nline",yield')).toBe(',');
    expect(guessDelimiter('"multi\r\nline",yield')).toBe(',');
  });

  it('falls back to ";" for space-only separated headers', () => {
    expect(guessDelimiter('col a col b\n')).toBe(';');
  });

  it('detects comma after BOM is stripped via normalizeCsvText', () => {
    expect(guessDelimiter(normalizeCsvText('\uFEFFa,b'))).toBe(',');
  });
});
