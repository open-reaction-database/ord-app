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
import { notifications } from '@mantine/notifications';
import { showNotification } from './showNotification.tsx';
import { NotificationVariant } from 'common/types/notification.ts';

vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const showMock = vi.mocked(notifications.show);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('showNotification', () => {
  it('forwards the message and the shared default options to notifications.show', () => {
    showNotification({ variant: NotificationVariant.SUCCESS, message: 'Saved' });
    expect(showMock).toHaveBeenCalledTimes(1);
    expect(showMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Saved',
        autoClose: 4000,
        color: 'transparent',
        withBorder: false,
      }),
    );
  });

  it('chooses a different icon for the success and error variants', () => {
    showNotification({ variant: NotificationVariant.SUCCESS, message: 'ok' });
    showNotification({ variant: NotificationVariant.ERROR, message: 'bad' });
    expect(showMock.mock.calls[0][0].icon).not.toEqual(showMock.mock.calls[1][0].icon);
  });
});
