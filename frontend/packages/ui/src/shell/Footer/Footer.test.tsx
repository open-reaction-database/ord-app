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
import { afterEach, describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '#testing/renderWithMantine.tsx';
import { DEFAULT_VIEWPORT_WIDTH, setViewportWidth } from '#testing/setViewportWidth.ts';
import { Footer } from './Footer.tsx';

function itemsWrap() {
  const items = screen.getByText(/© Copyright/).parentElement as HTMLElement;
  return getComputedStyle(items).flexWrap === 'wrap';
}

describe('Footer', () => {
  it('renders the dated copyright line and external links', () => {
    renderWithMantine(<Footer />);
    expect(
      screen.getByText(/© Copyright \d{4} Open Reaction Database/),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(2);
  });

  it('links the support address', () => {
    renderWithMantine(<Footer />);
    const link = screen.getByRole('link', { name: 'help@open-reaction-database.org' });
    expect(link).toHaveAttribute('href', 'mailto:help@open-reaction-database.org');
  });

  describe('at different widths', () => {
    afterEach(() => {
      setViewportWidth(DEFAULT_VIEWPORT_WIDTH);
    });

    it('keeps its items on one line from the sm breakpoint up', () => {
      setViewportWidth(768);
      renderWithMantine(<Footer />);
      expect(itemsWrap()).toBe(false);
    });

    it('wraps its items onto more lines below the sm breakpoint', () => {
      setViewportWidth(375);
      renderWithMantine(<Footer />);
      expect(itemsWrap()).toBe(true);
    });
  });
});
