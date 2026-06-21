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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as htmlToImage from 'html-to-image';
import { copyPreviewAsImage, getProductYieldPercent } from './reactionPreview.utils.ts';
import { showNotification } from 'common/utils/showNotification.tsx';
import { NotificationVariant } from 'common/types/notification.ts';
import type { ReactionProduct } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';

vi.mock('html-to-image', () => ({ toBlob: vi.fn() }));
vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));

const toBlobMock = vi.mocked(htmlToImage.toBlob);
const notifyMock = vi.mocked(showNotification);
const clipboardWrite = vi.fn().mockResolvedValue(undefined);
const node = { scrollWidth: 120 } as HTMLDivElement;

const expectNotified = (variant: NotificationVariant) =>
  expect(notifyMock).toHaveBeenCalledWith(expect.objectContaining({ variant }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    'ClipboardItem',
    vi.fn((items: unknown) => ({ items })),
  );
  Object.defineProperty(globalThis, 'navigator', {
    value: { clipboard: { write: clipboardWrite } },
    configurable: true,
  });
});

describe('copyPreviewAsImage', () => {
  it('notifies an error and does nothing when there is no node', async () => {
    await copyPreviewAsImage(null);
    expect(toBlobMock).not.toHaveBeenCalled();
    expectNotified(NotificationVariant.ERROR);
  });

  it('writes the rendered blob to the clipboard and reports success', async () => {
    toBlobMock.mockResolvedValue(new Blob(['x'], { type: 'image/png' }));
    await copyPreviewAsImage(node);
    expect(clipboardWrite).toHaveBeenCalledTimes(1);
    expectNotified(NotificationVariant.SUCCESS);
  });

  it('notifies an error when rendering produces no blob', async () => {
    toBlobMock.mockResolvedValue(null);
    await copyPreviewAsImage(node);
    expect(clipboardWrite).not.toHaveBeenCalled();
    expectNotified(NotificationVariant.ERROR);
  });

  it('notifies an error when rendering throws', async () => {
    toBlobMock.mockRejectedValue(new Error('boom'));
    await copyPreviewAsImage(node);
    expectNotified(NotificationVariant.ERROR);
  });
});

describe('getProductYieldPercent (#598)', () => {
  const product = (measurements: Array<unknown>): ReactionProduct =>
    ({ measurements }) as unknown as ReactionProduct;

  it('returns the percent value of a YIELD measurement', () => {
    const p = product([
      { type: 'PURITY', value: { type: '%', value: { value: 99 } } },
      { type: 'YIELD', value: { type: '%', value: { value: 85 } } },
    ]);
    expect(getProductYieldPercent(p)).toBe(85);
  });

  it('returns undefined when there is no YIELD measurement', () => {
    expect(
      getProductYieldPercent(
        product([{ type: 'PURITY', value: { type: '%', value: { value: 99 } } }]),
      ),
    ).toBeUndefined();
  });

  it('returns undefined when the YIELD measurement is not a percent value', () => {
    expect(
      getProductYieldPercent(
        product([{ type: 'YIELD', value: { type: 'String', value: 'n/a' } }]),
      ),
    ).toBeUndefined();
  });

  it('returns undefined when the YIELD percent has no numeric value', () => {
    expect(
      getProductYieldPercent(
        product([{ type: 'YIELD', value: { type: '%', value: { value: null } } }]),
      ),
    ).toBeUndefined();
  });

  it('handles a product with no measurements', () => {
    expect(getProductYieldPercent({} as ReactionProduct)).toBeUndefined();
  });
});
