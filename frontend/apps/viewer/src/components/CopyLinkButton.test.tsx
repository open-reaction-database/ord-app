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
import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderAt } from '#test/render.tsx';
import { CopyLinkButton } from '#components/CopyLinkButton.tsx';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CopyLinkButton', () => {
  it("copies the page's address, and says so", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const { getByRole, findByRole } = renderAt('/', <CopyLinkButton />);
    await user.click(getByRole('button', { name: 'Copy link' }));
    expect(writeText).toHaveBeenCalledWith(globalThis.location.href);
    expect(await findByRole('button', { name: 'Link copied' })).toBeInTheDocument();
  });
  it('copies the address as it is when clicked', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const { getByRole } = renderAt('/', <CopyLinkButton />);
    globalThis.history.pushState(null, '', '/reactions?id=ord-later');
    await user.click(getByRole('button', { name: 'Copy link' }));
    expect(writeText).toHaveBeenCalledWith(
      `${globalThis.location.origin}/reactions?id=ord-later`,
    );
  });
});
