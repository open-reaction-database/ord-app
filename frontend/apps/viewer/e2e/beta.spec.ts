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
import { expect, test, type Locator } from '@playwright/test';

/** WCAG AA's least contrast for body text. */
const LEAST_CONTRAST = 4.5;

/** The WCAG contrast of an element's text against the backgrounds beneath it. */
async function contrast(text: Locator): Promise<number> {
  return text.evaluate(element => {
    const parse = (color: string) => {
      const [r = 0, g = 0, b = 0, a = 1] = (color.match(/[\d.]+/g) ?? []).map(Number);
      return { r, g, b, a };
    };
    // A translucent background shows what is beneath it, so composite from the first
    // opaque one up; the page beneath them all is white.
    const layers = [];
    for (let node: Element | null = element; node !== null; node = node.parentElement) {
      const layer = parse(getComputedStyle(node).backgroundColor);
      layers.unshift(layer);
      if (layer.a === 1) {
        break;
      }
    }
    const beneath = layers.reduce(
      (below, { r, g, b, a }) => ({
        r: r * a + below.r * (1 - a),
        g: g * a + below.g * (1 - a),
        b: b * a + below.b * (1 - a),
      }),
      { r: 255, g: 255, b: 255 },
    );
    const luminance = ({ r, g, b }: { r: number; g: number; b: number }) => {
      const linear = (channel: number) => {
        const value = channel / 255;
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
    };
    const foreground = luminance(parse(getComputedStyle(element).color));
    const background = luminance(beneath);
    return (
      (Math.max(foreground, background) + 0.05) /
      (Math.min(foreground, background) + 0.05)
    );
  });
}

test("the front page's beta badge is legible", async ({ page }) => {
  await page.goto('/');
  const badge = page.getByText('Beta', { exact: true });
  await expect(badge).toBeVisible();
  expect(await contrast(badge)).toBeGreaterThanOrEqual(LEAST_CONTRAST);
});

test("the ask page's beta note is legible", async ({ page }) => {
  await page.goto('/ask');
  const note = page.getByText(/This feature is in beta/);
  await expect(note).toBeVisible();
  expect(await contrast(note)).toBeGreaterThanOrEqual(LEAST_CONTRAST);
});

// The sentence sits on the beta note's yellow tint on the ask page, and on the question
// box's primary tint on the front page.
for (const [where, path] of [
  ['front page', '/'],
  ['ask page', '/ask'],
]) {
  test(`the ${where}'s sentence on where a question is sent is legible`, async ({
    page,
  }) => {
    await page.goto(path);
    const disclosure = page.getByText(/sent to Anthropic/);
    await expect(disclosure).toBeVisible();
    expect(await contrast(disclosure)).toBeGreaterThanOrEqual(LEAST_CONTRAST);
  });
}
