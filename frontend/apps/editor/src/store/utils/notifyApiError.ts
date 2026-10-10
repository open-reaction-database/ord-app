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
import { showNotification } from 'common/utils/showNotification.tsx';
import { NotificationVariant } from 'common/types/notification.ts';
import { getErrorDetails } from './handleApiError.ts';

/**
 * Show an error toast for a failed request, mapping the HTTP status to a human-readable message.
 *
 * Use this in flows that catch their own request errors (and would otherwise swallow them) so the
 * user gets feedback instead of a silent console log — e.g. a removed dataset (404) or lost group
 * access (403) during download/enumeration. (#614, #616)
 */
export function notifyApiError(error: unknown) {
  showNotification({
    variant: NotificationVariant.ERROR,
    message: getErrorDetails(error).errorMessage,
  });
}
