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
/** The backend's bound on a question's length in characters, after trimming. */
export const MAX_QUESTION = 2000;

/** ord-interface's examples. */
export const ASK_EXAMPLES = [
  'reactions for synthesizing ibuprofen',
  'reactions using benzene as an input with yield greater than 70%',
  'reactions that make an aryl boronic acid',
];

/** Whether a trimmed question is longer than the backend takes. */
export function isTooLong(question: string): boolean {
  // By code point, as the backend counts, not by UTF-16 unit as length does.
  return [...question].length > MAX_QUESTION;
}

/** The ask page's address with a question, which it asks on arrival. */
export function askPath(question: string): string {
  return `/ask?${new URLSearchParams({ q: question })}`;
}
