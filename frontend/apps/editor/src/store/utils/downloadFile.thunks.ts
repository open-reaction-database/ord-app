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

export type DownloadThunk = ThunkAction<Promise<void>, AppState, void, Action>;

export const downloadFileFromUrl =
  (url: string): DownloadThunk =>
  async () => {
    try {
      const response = await axiosInstance.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: (response.headers['content-type'] as string | null) ?? undefined,
      });
      const header = response.headers['content-disposition'] as string | undefined;
      if (header === undefined) {
        throw new Error('Missing Content-Disposition header');
      }
      downloadFile(blob, fileNameFromContentDisposition(header));
    } catch (error) {
      // A removed dataset/reaction (404) or lost group access (403) rejects the download; tell the
      // user instead of only logging to the console. (#616)
      notifyApiError(error);
    }
  };

interface DownloadLinkResponse {
  token: string;
}

/**
 * Downloads a dataset through a short-lived link that the browser fetches itself, so the file
 * streams to disk and shows in the browser's downloads list with its progress.
 */
export const downloadDatasetThroughLink =
  (datasetId: number, format: string): DownloadThunk =>
  async () => {
    try {
      const { data } = await axiosInstance.post<DownloadLinkResponse>(
        `/datasets/${datasetId}/download-link`,
        null,
        { params: { file_format: format } },
      );
      const link = document.createElement('a');
      link.href = axiosInstance.getUri({ url: `/downloads/${data.token}` });
      // On the app's own origin, this keeps a failed response from replacing the app. The
      // Content-Disposition header names the file.
      link.download = '';
      document.body.append(link);
      link.click();
      link.remove();
    } catch (error) {
      notifyApiError(error);
    }
  };

export function downloadAsJson<T>(object: T, filename: string) {
  const jsonString = JSON.stringify(object, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadFile(blob, filename);
}
