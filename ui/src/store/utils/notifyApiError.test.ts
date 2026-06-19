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
import { showNotification } from 'common/utils/showNotification.tsx';
import { NotificationVariant } from 'common/types/notification.ts';
import { notifyApiError } from './notifyApiError.ts';

vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));
const showMock = vi.mocked(showNotification);

function axiosError(status: number, data?: unknown) {
  return { isAxiosError: true, response: { status, data } } as unknown;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('notifyApiError', () => {
  it('shows an error toast with the mapped message for a 403 (#614/#616)', () => {
    notifyApiError(axiosError(403));
    expect(showMock).toHaveBeenCalledWith({ variant: NotificationVariant.ERROR, message: 'Access denied' });
  });

  it('maps 404 to "Entity not found"', () => {
    notifyApiError(axiosError(404));
    expect(showMock).toHaveBeenCalledWith({ variant: NotificationVariant.ERROR, message: 'Entity not found' });
  });

  it('prefers the backend-provided message when present', () => {
    notifyApiError(axiosError(403, { message: 'You cannot edit this dataset' }));
    expect(showMock).toHaveBeenCalledWith({
      variant: NotificationVariant.ERROR,
      message: 'You cannot edit this dataset',
    });
  });

  it('falls back to the generic message for a non-axios error', () => {
    notifyApiError(new Error('boom'));
    expect(showMock).toHaveBeenCalledWith({ variant: NotificationVariant.ERROR, message: 'Unknown error' });
  });
});
