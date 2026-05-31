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
import { guessDelimiter } from './templateFileSelector.utils.ts';

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

  it('treats a space like any other non-alphanumeric delimiter character', () => {
    // `allowedSymbols` is /[A-Za-z0-9]/, so spaces count as delimiters: a
    // consistently space-separated header yields ' ', while a header mixing
    // spaces with another separator is "mixed" and falls back to ';'.
    expect(guessDelimiter('col a col b\n')).toBe(' ');
    expect(guessDelimiter('first name,last name\n')).toBe(';');
  });
});
