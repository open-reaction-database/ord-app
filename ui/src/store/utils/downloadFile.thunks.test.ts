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
import axiosInstance from '../axiosInstance.ts';
import {
  downloadDatasetThroughLink,
  downloadFile,
  downloadFileFromUrl,
  downloadAsJson,
  fileNameFromContentDisposition,
} from './downloadFile.thunks.ts';
import { notifyApiError } from './notifyApiError.ts';

vi.mock('../axiosInstance.ts', () => ({
  default: { get: vi.fn(), post: vi.fn(), getUri: vi.fn() },
}));
vi.mock('./notifyApiError.ts', () => ({ notifyApiError: vi.fn() }));
const axiosMock = axiosInstance as unknown as Record<
  'get' | 'post' | 'getUri',
  ReturnType<typeof vi.fn>
>;

let clickSpy: Mock<() => void>;
let lastAnchor: HTMLAnchorElement | undefined;
let createObjectURL: ReturnType<typeof vi.fn>;
let revokeObjectURL: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.resetAllMocks();
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

describe('downloadDatasetThroughLink', () => {
  it('has the browser fetch a link made for the dataset and format', async () => {
    axiosMock.post.mockResolvedValueOnce({ data: { token: '5.json.7.123.sig' } });
    axiosMock.getUri.mockImplementationOnce(
      ({ url }: { url: string }) => `https://example.org/api/v1${url}`,
    );
    let connectedWhenClicked: boolean | undefined;
    clickSpy.mockImplementationOnce(() => {
      connectedWhenClicked = lastAnchor?.isConnected;
    });

    await downloadDatasetThroughLink(5, 'json')(vi.fn(), vi.fn(), undefined);

    expect(axiosMock.post).toHaveBeenCalledWith('/datasets/5/download-link', null, {
      params: { file_format: 'json' },
    });
    expect(lastAnchor?.href).toBe(
      'https://example.org/api/v1/downloads/5.json.7.123.sig',
    );
    expect(lastAnchor?.hasAttribute('download')).toBe(true);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(connectedWhenClicked).toBe(true);
    expect(lastAnchor?.isConnected).toBe(false);
  });

  it('notifies the user, and opens nothing, when the link cannot be made', async () => {
    axiosMock.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 422 },
    });

    await expect(
      downloadDatasetThroughLink(5, 'parquet')(vi.fn(), vi.fn(), undefined),
    ).resolves.toBeUndefined();

    expect(clickSpy).not.toHaveBeenCalled();
    expect(notifyApiError).toHaveBeenCalledTimes(1);
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
