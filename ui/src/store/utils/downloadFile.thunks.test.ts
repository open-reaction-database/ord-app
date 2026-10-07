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
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { notifications } from '@mantine/notifications';
import type { AxiosProgressEvent, AxiosRequestConfig } from 'axios';
import { showNotification } from 'common/utils/showNotification.tsx';
import { NotificationVariant } from 'common/types/notification.ts';
import axiosInstance from '../axiosInstance.ts';
import {
  downloadFile,
  downloadFileFromUrl,
  downloadAsJson,
  fileNameFromContentDisposition,
  formatMegabytes,
} from './downloadFile.thunks.ts';
import { notifyApiError } from './notifyApiError.ts';

vi.mock('../axiosInstance.ts', () => ({ default: { get: vi.fn() } }));
vi.mock('./notifyApiError.ts', () => ({ notifyApiError: vi.fn() }));
vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn(), update: vi.fn(), hide: vi.fn() },
}));
vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));
const axiosMock = axiosInstance as unknown as Record<'get', ReturnType<typeof vi.fn>>;

let clickSpy: Mock<() => void>;
let lastAnchor: HTMLAnchorElement | undefined;
let createObjectURL: ReturnType<typeof vi.fn>;
let revokeObjectURL: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  lastAnchor = undefined;
  clickSpy = vi.fn();
  createObjectURL = vi.fn(() => 'blob:mock-url');
  revokeObjectURL = vi.fn();
  // happy-dom doesn't implement object URLs; stub the two methods used here.
  vi.stubGlobal(
    'URL',
    Object.assign(Object.create(URL), { createObjectURL, revokeObjectURL }),
  );
  const realCreate = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    const el = realCreate(tag);
    if (tag === 'a') {
      (el as HTMLAnchorElement).click = clickSpy;
      lastAnchor = el as HTMLAnchorElement;
    }
    return el;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('downloadFile', () => {
  it('creates an object URL, clicks an anchor with the filename, and revokes the URL', () => {
    downloadFile(new Blob(['hi']), 'note.txt');
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(lastAnchor?.download).toBe('note.txt');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
  });
});

describe('fileNameFromContentDisposition', () => {
  it('prefers the UTF-8 filename* over the ASCII fallback', () => {
    expect(
      fileNameFromContentDisposition(
        `attachment; filename="C_N coupling.json"; filename*=UTF-8''C%E2%80%93N%20coupling.json`,
      ),
    ).toBe('C–N coupling.json');
  });

  it('uses the quoted filename when there is no filename*', () => {
    expect(fileNameFromContentDisposition('attachment; filename="report.json"')).toBe(
      'report.json',
    );
  });

  it('throws when the header names no file', () => {
    expect(() => fileNameFromContentDisposition('attachment')).toThrow();
  });
});

describe('downloadFileFromUrl', () => {
  it('fetches the blob and downloads it using the content-disposition filename', async () => {
    axiosMock.get.mockResolvedValueOnce({
      data: 'payload',
      headers: {
        'content-type': 'application/json',
        'content-disposition': 'attachment; filename="report.json"',
      },
    });
    await downloadFileFromUrl('/datasets/5/download')(vi.fn(), vi.fn(), undefined);
    expect(axiosMock.get).toHaveBeenCalledWith('/datasets/5/download', {
      responseType: 'blob',
    });
    expect(lastAnchor?.download).toBe('report.json');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(notifications.show).not.toHaveBeenCalled();
  });

  it('notifies the user (no throw, no download) when the request fails (#616)', async () => {
    axiosMock.get.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404 },
    });
    await expect(
      downloadFileFromUrl('/bad')(vi.fn(), vi.fn(), undefined),
    ).resolves.toBeUndefined();
    expect(clickSpy).not.toHaveBeenCalled();
    expect(notifyApiError).toHaveBeenCalledTimes(1);
  });
});

describe('downloadFileFromUrl with a file name', () => {
  const blobResponse = {
    data: 'payload',
    headers: { 'content-disposition': 'attachment; filename="data.json"' },
  };

  const streamOf = (...chunks: Array<string>) =>
    new ReadableStream<Uint8Array>({
      start(controller) {
        chunks.forEach(chunk => controller.enqueue(new TextEncoder().encode(chunk)));
        controller.close();
      },
    });

  // A file handle whose writable stream records what is written to it.
  const fakeFileHandle = () => {
    const file = { written: Array<string>(), closed: false };
    const createWritable = vi.fn(
      async () =>
        new WritableStream<Uint8Array>({
          write(chunk) {
            file.written.push(new TextDecoder().decode(chunk));
          },
          close() {
            file.closed = true;
          },
        }),
    );
    return { file, createWritable, handle: { createWritable } };
  };

  const stubSaveFilePicker = (result: Promise<unknown>) => {
    const showSaveFilePicker = vi.fn((_options: { suggestedName: string }) => result);
    vi.stubGlobal('showSaveFilePicker', showSaveFilePicker);
    return showSaveFilePicker;
  };

  it('streams the response into the file the user picks', async () => {
    const { file, handle } = fakeFileHandle();
    const showSaveFilePicker = stubSaveFilePicker(Promise.resolve(handle));
    axiosMock.get.mockResolvedValueOnce({
      data: streamOf('{"a"', ': 1}'),
      headers: {},
    });

    const download = downloadFileFromUrl('/datasets/5/download', 'data.json')(
      vi.fn(),
      vi.fn(),
      undefined,
    );
    // Synchronously, inside the click that dispatched the download: browsers open the
    // dialog only during a user gesture.
    expect(showSaveFilePicker).toHaveBeenCalledWith({ suggestedName: 'data.json' });
    expect(axiosMock.get).not.toHaveBeenCalled();
    await download;

    expect(axiosMock.get).toHaveBeenCalledWith('/datasets/5/download', {
      adapter: 'fetch',
      responseType: 'stream',
      onDownloadProgress: expect.any(Function),
    });
    expect(file).toEqual({ written: ['{"a"', ': 1}'], closed: true });
    expect(clickSpy).not.toHaveBeenCalled();
    expect(notifications.hide).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledWith({
      variant: NotificationVariant.SUCCESS,
      message: 'Downloaded data.json',
    });
  });

  it('does nothing when the user cancels the save dialog', async () => {
    stubSaveFilePicker(Promise.reject(new DOMException('Cancelled', 'AbortError')));

    await downloadFileFromUrl('/datasets/5/download', 'data.json')(
      vi.fn(),
      vi.fn(),
      undefined,
    );

    expect(axiosMock.get).not.toHaveBeenCalled();
    expect(notifications.show).not.toHaveBeenCalled();
    expect(notifyApiError).not.toHaveBeenCalled();
  });

  it('falls back to a Blob download when the save dialog fails otherwise', async () => {
    stubSaveFilePicker(Promise.reject(new DOMException('No gesture', 'SecurityError')));
    axiosMock.get.mockResolvedValueOnce(blobResponse);

    await downloadFileFromUrl('/datasets/5/download', 'data.json')(
      vi.fn(),
      vi.fn(),
      undefined,
    );

    expect(axiosMock.get).toHaveBeenCalledWith('/datasets/5/download', {
      responseType: 'blob',
      onDownloadProgress: expect.any(Function),
    });
    expect(lastAnchor?.download).toBe('data.json');
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('counts the bytes received in a notification without a save dialog', async () => {
    axiosMock.get.mockImplementationOnce(
      async (_url: string, config: AxiosRequestConfig) => {
        config.onDownloadProgress?.({ loaded: 2_500_000 } as AxiosProgressEvent);
        return blobResponse;
      },
    );

    await downloadFileFromUrl('/datasets/5/download', 'data.json')(
      vi.fn(),
      vi.fn(),
      undefined,
    );

    const [shown] = vi.mocked(notifications.show).mock.calls[0];
    expect(shown).toMatchObject({ loading: true, title: 'Downloading data.json' });
    expect(notifications.update).toHaveBeenCalledWith({
      id: shown.id,
      message: '2.5 MB received',
    });
    expect(notifications.hide).toHaveBeenCalledWith(shown.id);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('opens no file and notifies the user when the request fails', async () => {
    const { createWritable, handle } = fakeFileHandle();
    stubSaveFilePicker(Promise.resolve(handle));
    axiosMock.get.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404 },
    });

    await downloadFileFromUrl('/datasets/5/download', 'data.json')(
      vi.fn(),
      vi.fn(),
      undefined,
    );

    expect(createWritable).not.toHaveBeenCalled();
    expect(notifications.hide).toHaveBeenCalledTimes(1);
    expect(showNotification).not.toHaveBeenCalled();
    expect(notifyApiError).toHaveBeenCalledTimes(1);
  });
});

describe('formatMegabytes', () => {
  it('shows decimal megabytes to one place', () => {
    expect(formatMegabytes(955_598_120)).toBe('955.6 MB');
    expect(formatMegabytes(0)).toBe('0.0 MB');
  });
});

describe('downloadAsJson', () => {
  it('serializes the object and downloads it under the given filename', () => {
    downloadAsJson({ a: 1 }, 'data.json');
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(lastAnchor?.download).toBe('data.json');
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});
