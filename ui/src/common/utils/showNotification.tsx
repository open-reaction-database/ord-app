/*
 * Copyright 2024 Open Reaction Database Project Authors
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
import { notifications } from '@mantine/notifications';
import { CheckCircleIcon, CrossCircleIcon } from 'common/icons';
import { NotificationVariant, type AppNotification } from 'common/types/notification.ts';
import type { ReactNode } from 'react';

const iconByVariant: Record<NotificationVariant, ReactNode> = {
  [NotificationVariant.ERROR]: <CrossCircleIcon />,
  [NotificationVariant.SUCCESS]: <CheckCircleIcon />,
};

export function showNotification({ variant, ...rest }: AppNotification) {
  notifications.show({
    autoClose: 4000,
    icon: iconByVariant[variant],
    color: 'transparent',
    radius: '8px',
    withBorder: false,
    ...rest,
  });
}
