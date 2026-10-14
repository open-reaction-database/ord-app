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
import { renderAt } from '#test/render.tsx';
import { LinkedText } from '#components/LinkedText.tsx';

function links(text: string) {
  const { queryAllByRole } = renderAt('/', <LinkedText text={text} />);
  return queryAllByRole('link').map(link => [
    link.textContent,
    link.getAttribute('href'),
  ]);
}

describe('LinkedText', () => {
  it.each([
    [
      'See https://example.com/a.',
      [['https://example.com/a', 'https://example.com/a']],
    ],
    ['At www.example.com today', [['www.example.com', 'https://www.example.com']]],
    [
      'DOI: 10.1021/jacs.6c05959.',
      [['10.1021/jacs.6c05959', 'https://doi.org/10.1021/jacs.6c05959']],
    ],
    [
      '(DOI: 10.15227/orgsyn.095.0080)',
      [['10.15227/orgsyn.095.0080', 'https://doi.org/10.15227/orgsyn.095.0080']],
    ],
    [
      'https://en.wikipedia.org/wiki/Foo_(bar)',
      [
        [
          'https://en.wikipedia.org/wiki/Foo_(bar)',
          'https://en.wikipedia.org/wiki/Foo_(bar)',
        ],
      ],
    ],
    [
      'https://doi.org/10.1021/x and 10.1039/y',
      [
        ['https://doi.org/10.1021/x', 'https://doi.org/10.1021/x'],
        ['10.1039/y', 'https://doi.org/10.1039/y'],
      ],
    ],
    ['No links here', []],
  ])('links %j', (text, expected) => {
    expect(links(text)).toEqual(expected);
  });

  it('keeps the text around the links', () => {
    const { container } = renderAt(
      '/',
      <LinkedText text="Before https://example.com, after." />,
    );
    expect(container).toHaveTextContent('Before https://example.com, after.');
  });

  it('opens links in a new tab', () => {
    const { getByRole } = renderAt('/', <LinkedText text="https://example.com" />);
    expect(getByRole('link')).toHaveAttribute('target', '_blank');
    expect(getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
