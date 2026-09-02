/*
 * Copyright 2024 Open Reaction Database Project Authors
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
const defaultDelimiter = ';';
const delimiterCandidates = new Set([',', ';', '\t', '|']);
const lineBreaks = new Set(['\n', '\r']);

export function normalizeCsvText(content: string): string {
  return content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
}

export function guessDelimiter(fileContent: string): string {
  let firstLineDelimiters = '';
  let inQuotes = false;
  let index = 0;
  while (index < fileContent.length) {
    const char = fileContent.charAt(index);
    if (!inQuotes && lineBreaks.has(char)) {
      break;
    }
    if (char === '"') {
      if (inQuotes && fileContent.charAt(index + 1) === '"') {
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (!inQuotes && delimiterCandidates.has(char)) {
      firstLineDelimiters += char;
    }
    index++;
  }

  if (
    firstLineDelimiters.length === 0 ||
    !firstLineDelimiters.split('').every((item, _, symbols) => item === symbols[0])
  ) {
    return defaultDelimiter;
  }
  return firstLineDelimiters[0];
}
