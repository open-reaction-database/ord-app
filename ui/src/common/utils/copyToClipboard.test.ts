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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyToClipboard } from './copyToClipboard.ts';

const writeText = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(globalThis, 'navigator', { value: { clipboard: { writeText } }, configurable: true });
});

describe('copyToClipboard', () => {
  it('writes the given text to the clipboard', () => {
    writeText.mockResolvedValue(undefined);
    copyToClipboard('hello world');
    expect(writeText).toHaveBeenCalledWith('hello world');
  });

  it('logs the error and does not throw when the clipboard write is rejected', async () => {
    const error = new Error('denied');
    writeText.mockRejectedValue(error);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => copyToClipboard('x')).not.toThrow();
    expect(writeText).toHaveBeenCalledWith('x');
    await vi.waitFor(() => expect(errorSpy).toHaveBeenCalledWith(error));
  });
});
