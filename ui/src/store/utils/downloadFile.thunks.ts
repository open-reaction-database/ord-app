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
import type { Action, ThunkAction } from '@reduxjs/toolkit';
import { notifications } from '@mantine/notifications';
import type { AxiosProgressEvent } from 'axios';
import { showNotification } from 'common/utils/showNotification.tsx';
import { NotificationVariant } from 'common/types/notification.ts';
import type { AppState } from '../configureAppStore.ts';
import axiosInstance from '../axiosInstance.ts';
import { notifyApiError } from './notifyApiError.ts';

export const downloadFile = (blob: Blob, fileName: string) => {
  const link = document.createElement('a');

  try {
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();

    link.remove();
  } finally {
    URL.revokeObjectURL(link.href);
  }
};

// The backend names a download twice (RFC 6266): `filename*` holds the exact name,
// percent-encoded as UTF-8, and `filename` an ASCII fallback.
export const fileNameFromContentDisposition = (header: string): string => {
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (encoded) {
    return decodeURIComponent(encoded[1]);
  }
  const quoted = /filename="([^"]*)"/.exec(header);
  if (quoted) {
    return quoted[1];
  }
  throw new Error('Missing file name in Content-Disposition header');
};

// The File System Access API's save dialog. Only Chromium-based browsers have it, and
// TypeScript's DOM library does not declare it.
type ShowSaveFilePicker = (options: {
  suggestedName: string;
}) => Promise<FileSystemFileHandle>;

const getSaveFilePicker = (): ShowSaveFilePicker | undefined =>
  (window as Window & { showSaveFilePicker?: ShowSaveFilePicker }).showSaveFilePicker;

export const formatMegabytes = (bytes: number): string =>
  `${(bytes / 1e6).toFixed(1)} MB`;

let downloadCount = 0;

// Shows a notification that counts the bytes received until the download finishes.
const trackDownload = (fileName: string) => {
  downloadCount += 1;
  const id = `download-${downloadCount}`;
  notifications.show({
    id,
    loading: true,
    autoClose: false,
    withCloseButton: false,
    title: `Downloading ${fileName}`,
    message: `${formatMegabytes(0)} received`,
  });
  return {
    onDownloadProgress: (event: AxiosProgressEvent) => {
      notifications.update({
        id,
        message: `${formatMegabytes(event.loaded)} received`,
      });
    },
    finish: () => {
      notifications.hide(id);
      showNotification({
        variant: NotificationVariant.SUCCESS,
        message: `Downloaded ${fileName}`,
      });
    },
    fail: () => {
      notifications.hide(id);
    },
  };
};

// Streams the response into the chosen file, so the browser never holds the whole file.
const saveToFile = async (
  url: string,
  handle: FileSystemFileHandle,
  onDownloadProgress?: (event: AxiosProgressEvent) => void,
) => {
  const response = await axiosInstance.get<ReadableStream<Uint8Array>>(url, {
    adapter: 'fetch',
    responseType: 'stream',
    onDownloadProgress,
  });
  await response.data.pipeTo(await handle.createWritable());
};

const saveThroughBlob = async (
  url: string,
  onDownloadProgress?: (event: AxiosProgressEvent) => void,
) => {
  const response = await axiosInstance.get(url, {
    responseType: 'blob',
    ...(onDownloadProgress && { onDownloadProgress }),
  });

  const blob = new Blob([response.data], {
    type: (response.headers['content-type'] as string | null) ?? undefined,
  });
  const header = response.headers['content-disposition'] as string | undefined;
  if (header === undefined) {
    throw new Error('Missing Content-Disposition header');
  }
  downloadFile(blob, fileNameFromContentDisposition(header));
};

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

// Where a download goes: a file the user picked, a Blob, or nowhere if they cancelled.
type SaveTarget = FileSystemFileHandle | 'blob' | 'cancelled';

// Opens the save dialog synchronously, while the click still counts as a user gesture.
const chooseSaveTarget = async (fileName?: string): Promise<SaveTarget> => {
  const showSaveFilePicker = fileName === undefined ? undefined : getSaveFilePicker();
  if (fileName === undefined || showSaveFilePicker === undefined) {
    return 'blob';
  }
  try {
    return await showSaveFilePicker({ suggestedName: fileName });
  } catch (error) {
    // Any failure other than a cancel, such as a rejected name, falls back to a Blob.
    return isAbortError(error) ? 'cancelled' : 'blob';
  }
};

/**
 * Downloads a file from the API.
 *
 * Without a file name, the response is collected into a Blob and saved under the name in its
 * Content-Disposition header. With one, a notification counts the bytes received, and where the
 * browser has a save dialog the response streams straight into the file the user picks, under
 * that suggested name.
 */
export const downloadFileFromUrl =
  (
    url: string,
    fileName?: string,
  ): ThunkAction<Promise<void>, AppState, void, Action> =>
  async () => {
    // The dialog comes before the request, so the server is not left waiting on an unread
    // response while the user picks a file.
    const target = await chooseSaveTarget(fileName);
    if (target === 'cancelled') {
      return;
    }
    const progress = fileName === undefined ? undefined : trackDownload(fileName);
    try {
      await (target === 'blob'
        ? saveThroughBlob(url, progress?.onDownloadProgress)
        : saveToFile(url, target, progress?.onDownloadProgress));
      progress?.finish();
    } catch (error) {
      progress?.fail();
      // A removed dataset/reaction (404) or lost group access (403) rejects the download; tell the
      // user instead of only logging to the console. (#616)
      notifyApiError(error);
    }
  };

export function downloadAsJson<T>(object: T, filename: string) {
  const jsonString = JSON.stringify(object, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadFile(blob, filename);
}
