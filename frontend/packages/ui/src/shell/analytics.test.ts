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
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';
import { loadAnalytics } from './analytics.ts';

const appWindow = globalThis as unknown as { dataLayer?: Array<unknown> };

describe('loadAnalytics', () => {
  // What the loader puts in the head, kept out of it so happy-dom does not try to load it.
  let append: MockInstance<(...nodes: Array<Node | string>) => void>;

  beforeEach(() => {
    append = vi.spyOn(document.head, 'append').mockImplementation(() => undefined);
  });

  afterEach(() => {
    append.mockRestore();
    delete appWindow.dataLayer;
  });

  it.each(['localhost', '127.0.0.1', '[::1]', 'viewer.localhost'])(
    'sends nothing from %s',
    hostname => {
      loadAnalytics('G-TEST', hostname);
      expect(append).not.toHaveBeenCalled();
      expect(appWindow.dataLayer).toBeUndefined();
    },
  );

  it.each([
    'open-reaction-database.org',
    'localhost.example.org',
    'mylocalhost',
    '127.0.0.10',
  ])('loads gtag.js from %s', hostname => {
    loadAnalytics('G-TEST', hostname);
    expect(append).toHaveBeenCalledTimes(1);
    const [tag] = append.mock.calls[0] as [HTMLScriptElement];
    expect(tag.src).toBe('https://www.googletagmanager.com/gtag/js?id=G-TEST');
    expect(tag.async).toBe(true);
    // gtag.js reads a command only as an Arguments object; an array it ignores.
    const commands = appWindow.dataLayer ?? [];
    expect(commands.map(command => Object.prototype.toString.call(command))).toEqual([
      '[object Arguments]',
      '[object Arguments]',
    ]);
    expect(commands.map(command => [...(command as IArguments)])).toEqual([
      ['js', expect.any(Date)],
      ['config', 'G-TEST'],
    ]);
  });

  it('keeps commands queued before it loads', () => {
    appWindow.dataLayer = ['queued'];
    loadAnalytics('G-TEST', 'open-reaction-database.org');
    expect(appWindow.dataLayer).toHaveLength(3);
    expect(appWindow.dataLayer[0]).toBe('queued');
  });

  it('reads the page’s own host by default', () => {
    // Vitest serves the page from localhost.
    expect(globalThis.location.hostname).toBe('localhost');
    loadAnalytics('G-TEST');
    expect(append).not.toHaveBeenCalled();
  });
});
