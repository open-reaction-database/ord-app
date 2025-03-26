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

export const downloadFileFromUrl =
  (url: string): ThunkAction<Promise<void>, AppState, void, Action> =>
  async () => {
    try {
      const response = await axiosInstance.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const header = response.headers['content-disposition'];
      const fileName = header.replace(/^.*filename="(.*)"/, '$1');
      downloadFile(blob, fileName);
    } catch (error) {
      console.error(error);
    }
  };

export function downloadAsJson<T>(object: T, filename: string) {
  const jsonString = JSON.stringify(object, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadFile(blob, filename);
}
