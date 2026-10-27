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

/** The backend's bound on how many structures one question names. */
export const MOST_STRUCTURES = 10;

/** ord-interface's examples. */
export const ASK_EXAMPLES = [
  'reactions for synthesizing ibuprofen',
  'reactions using benzene as an input with yield greater than 70%',
  'reactions that make an aryl boronic acid',
];

/** Each structure a question names, by its placeholder such as @A, as SMILES or SMARTS. */
export type Structures = Readonly<Record<string, string>>;

/** The names a question's structures take, in the order they are handed out. */
const PLACEHOLDERS = Array.from(
  { length: MOST_STRUCTURES },
  (_, index) => `@${String.fromCodePoint(65 + index)}`,
);

/** A placeholder's name, as the backend's pattern for one. */
const PLACEHOLDER = /^@[A-Z]+$/;

/** Whether a trimmed question is longer than the backend takes. */
export function isTooLong(question: string): boolean {
  // By code point, as the backend counts, not by UTF-16 unit as length does.
  return [...question].length > MAX_QUESTION;
}

/** The first name no structure holds, or undefined when a question holds all it may. */
export function nextPlaceholder(structures: Structures): string | undefined {
  return PLACEHOLDERS.find(name => !(name in structures));
}

/**
 * The ask page's address with a question and its structures, which it asks on arrival.
 *
 * They are carried in the fragment. A browser sends no fragment to a server, in a request
 * line or a Referer header, and the Google tag reports a page's address without one.
 */
export function askPath(question: string, structures: Structures = {}): string {
  const params = new URLSearchParams({ q: question });
  for (const [name, structure] of Object.entries(structures)) {
    params.append(name, structure);
  }
  return `/ask#${params}`;
}

/** The structures an address names, each under its placeholder's own parameter. */
export function readStructures(params: URLSearchParams): Structures {
  return Object.fromEntries([...params].filter(([name]) => PLACEHOLDER.test(name)));
}

/** The question with a placeholder written at its end. */
export function withPlaceholder(question: string, name: string): string {
  return `${question.trimEnd()} ${name}`.trimStart();
}

/**
 * The question without a placeholder where it stands alone.
 *
 * As the backend reads one, a name inside a word or after @, such as the SMILES [C@@H]
 * or an address, is not a placeholder, and stays.
 */
export function withoutPlaceholder(question: string, name: string): string {
  return question
    .replaceAll(new RegExp(String.raw`(?<![\w@])${name}(?!\w)`, 'g'), '')
    .replaceAll(/ {2,}/g, ' ')
    .trim();
}
