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
import { Anchor } from '@mantine/core';
import type { ReactNode } from 'react';

// Web addresses, and bare DOIs ("10.1021/jacs.6c05959", with or without a "DOI:"
// prefix). The address branch comes first, so the DOI in https://doi.org/10.1021/…
// is part of the address rather than a match of its own.
const LINK_PATTERN = /(?:https?:\/\/|www\.)[^\s<>"']+|\b10\.\d{4,9}\/[^\s<>"']+/g;
const TRAILING_PUNCTUATION = new Set('.,;:!?\'"');
const OPENING_BRACKETS: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

function count(text: string, character: string): number {
  return text.split(character).length - 1;
}

// Punctuation ending a match usually belongs to the prose around it. A closing bracket
// stays only when the link holds its opener: "(DOI: 10.1021/x)" drops the parenthesis,
// and ".../Foo_(bar)" keeps it.
function trimTrailingPunctuation(link: string): string {
  let end = link.length;
  for (;;) {
    while (end > 0 && TRAILING_PUNCTUATION.has(link[end - 1])) {
      end -= 1;
    }
    const trimmed = link.slice(0, end);
    const closing = trimmed.slice(-1);
    const opening = OPENING_BRACKETS[closing];
    if (!opening || count(trimmed, opening) >= count(trimmed, closing)) {
      return trimmed;
    }
    end -= 1;
  }
}

function hrefOf(link: string): string {
  if (/^https?:\/\//i.test(link)) {
    return link;
  }
  if (/^www\./i.test(link)) {
    return `https://${link}`;
  }
  return `https://doi.org/${link}`;
}

/** The text, with its web addresses and DOIs as links that open in a new tab. */
export function LinkedText({ text }: Readonly<{ text: string }>) {
  const nodes: Array<ReactNode> = [];
  const pattern = new RegExp(LINK_PATTERN);
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const link = trimTrailingPunctuation(match[0]);
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }
    nodes.push(
      <Anchor
        key={match.index}
        href={hrefOf(link)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {link}
      </Anchor>,
    );
    cursor = match.index + link.length;
    // Resume after the link, so the punctuation it left out is text.
    pattern.lastIndex = cursor;
  }
  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }
  return <>{nodes}</>;
}
