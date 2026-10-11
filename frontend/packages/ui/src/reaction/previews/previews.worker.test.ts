/*
 * Copyright 2026 Open Reaction Database Project Authors
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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// indigo wraps a WASM structure renderer that can't load under vitest; stub it
// so the worker's render path runs against predictable output. The
// real initIndigo() is also a no-op-at-import side effect we don't want here.
const { initIndigoMock, waitForIndigoMock, renderSvgMock } = vi.hoisted(() => ({
  initIndigoMock: vi.fn(),
  waitForIndigoMock: vi.fn(() => Promise.resolve()),
  renderSvgMock: vi.fn((component: unknown) => `<svg>${String(component)}</svg>`),
}));
vi.mock('./indigo.ts', () => ({
  initIndigo: initIndigoMock,
  waitForIndigo: waitForIndigoMock,
  renderSvg: renderSvgMock,
}));

// Importing the module calls initIndigo() and assigns the global onmessage handler.
import './previews.worker.ts';

// Counted at load, since every mock is reset before each test.
const initIndigoCallsAtLoad = initIndigoMock.mock.calls.length;

const handler = globalThis.onmessage as unknown as (event: { data: unknown }) => void;

let postMessageMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  postMessageMock = vi.fn();
  vi.stubGlobal('postMessage', postMessageMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('previews worker', () => {
  it('calls initIndigo once at module load', () => {
    expect(initIndigoCallsAtLoad).toBe(1);
  });

  it('ignores a message whose data is not an object', () => {
    handler({ data: 42 });
    expect(waitForIndigoMock).not.toHaveBeenCalled();
    expect(postMessageMock).not.toHaveBeenCalled();
  });

  it('ignores a null payload (typeof null === "object") instead of throwing', () => {
    handler({ data: null });
    expect(waitForIndigoMock).not.toHaveBeenCalled();
    expect(postMessageMock).not.toHaveBeenCalled();
  });

  it('ignores an object that is not a request', () => {
    handler({ data: { a: 'molA' } });
    handler({ data: { id: 3 } });
    expect(waitForIndigoMock).not.toHaveBeenCalled();
    expect(postMessageMock).not.toHaveBeenCalled();
  });

  it('renders every molblock at the requested size and replies with the request ID', async () => {
    handler({ data: { id: 3, molblocksById: { a: 'X', b: null }, size: 80 } });
    await vi.waitFor(() => expect(postMessageMock).toHaveBeenCalledTimes(1));
    expect(renderSvgMock).toHaveBeenCalledWith('X', 80);
    expect(renderSvgMock).toHaveBeenCalledWith(null, 80);
    expect(postMessageMock).toHaveBeenCalledWith({
      id: 3,
      svgsById: { a: '<svg>X</svg>', b: '<svg>null</svg>' },
    });
  });

  it('replies with the error when rendering throws', async () => {
    renderSvgMock.mockImplementationOnce(() => {
      throw new Error('aborted');
    });
    handler({ data: { id: 4, molblocksById: { a: 'X' }, size: 80 } });
    await vi.waitFor(() => expect(postMessageMock).toHaveBeenCalledTimes(1));
    expect(postMessageMock).toHaveBeenCalledWith({ id: 4, error: 'Error: aborted' });
  });

  it('replies with the error when Indigo fails to load', async () => {
    waitForIndigoMock.mockImplementationOnce(() =>
      Promise.reject(new Error('no wasm')),
    );
    handler({ data: { id: 3, molblocksById: { a: 'X', b: null }, size: 80 } });
    await vi.waitFor(() => expect(postMessageMock).toHaveBeenCalledTimes(1));
    expect(renderSvgMock).not.toHaveBeenCalled();
    expect(postMessageMock).toHaveBeenCalledWith({ id: 3, error: 'Error: no wasm' });
  });

  it('replies with an empty map for an empty request', async () => {
    handler({ data: { id: 4, molblocksById: {}, size: 120 } });
    await vi.waitFor(() => expect(postMessageMock).toHaveBeenCalledTimes(1));
    expect(renderSvgMock).not.toHaveBeenCalled();
    expect(postMessageMock).toHaveBeenCalledWith({ id: 4, svgsById: {} });
  });
});
