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
// so the worker's reduce-and-render path runs against predictable output. The
// real initIndigo() is also a no-op-at-import side effect we don't want here.
const { initIndigoMock, waitForIndigoMock, renderSvgMock } = vi.hoisted(() => ({
  initIndigoMock: vi.fn(),
  waitForIndigoMock: vi.fn(() => Promise.resolve()),
  renderSvgMock: vi.fn((component: unknown) => `<svg>${String(component)}</svg>`),
}));
vi.mock('common/utils/indigo.ts', () => ({
  initIndigo: initIndigoMock,
  waitForIndigo: waitForIndigoMock,
  renderSvg: renderSvgMock,
}));

// Importing the module calls initIndigo() and assigns the global onmessage handler.
import './worker.ts';

const handler = globalThis.onmessage as unknown as (event: { data: unknown }) => void;

let postMessageMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  postMessageMock = vi.fn();
  vi.stubGlobal('postMessage', postMessageMock);
  renderSvgMock.mockClear();
  waitForIndigoMock.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('previews worker', () => {
  it('calls initIndigo once at module load', () => {
    expect(initIndigoMock).toHaveBeenCalledTimes(1);
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

  it('renders every preview to SVG and posts the keyed result', async () => {
    handler({ data: { a: 'molA', b: 'molB' } });
    await vi.waitFor(() => expect(postMessageMock).toHaveBeenCalledTimes(1));
    expect(renderSvgMock).toHaveBeenCalledWith('molA');
    expect(renderSvgMock).toHaveBeenCalledWith('molB');
    expect(postMessageMock).toHaveBeenCalledWith({
      a: '<svg>molA</svg>',
      b: '<svg>molB</svg>',
    });
  });

  it('posts an empty object for an empty preview map', async () => {
    handler({ data: {} });
    await vi.waitFor(() => expect(postMessageMock).toHaveBeenCalledTimes(1));
    expect(renderSvgMock).not.toHaveBeenCalled();
    expect(postMessageMock).toHaveBeenCalledWith({});
  });
});
