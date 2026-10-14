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
import { MantineProvider, Textarea } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { theme } from './theme.ts';

function renderTextarea(autosize: boolean): HTMLElement {
  render(
    <MantineProvider theme={theme}>
      <Textarea
        label="Notes"
        autosize={autosize}
      />
    </MantineProvider>,
  );
  return screen.getByLabelText('Notes');
}

describe('theme', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses the ORD blue as its primary color', () => {
    expect(theme.primaryColor).toBe('primary');
    expect(theme.colors?.primary?.[0]).toBe('#3C78D8');
  });

  it('gives a plain textarea a minimum height', () => {
    expect(renderTextarea(false).style.minHeight).toBe('92px');
  });

  it('leaves an autosize textarea to size itself from its rows', () => {
    // Mantine autosizes a Textarea only outside the test environment.
    vi.stubEnv('NODE_ENV', 'development');
    expect(renderTextarea(true).style.minHeight).toBe('');
  });
});
