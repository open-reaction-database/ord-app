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
import {
  createPreviewRenderer,
  renderPreviews,
  type PreviewWorker,
} from './renderPreviews.ts';

class FakeWorker implements PreviewWorker {
  posted: Array<unknown> = [];
  terminated = false;
  onmessage: PreviewWorker['onmessage'] = null;
  onerror: PreviewWorker['onerror'] = null;
  postMessage(message: unknown) {
    this.posted.push(message);
  }
  terminate() {
    this.terminated = true;
  }
  reply(data: unknown) {
    this.onmessage?.({ data } as MessageEvent);
  }
  fail(event: Partial<ErrorEvent>) {
    this.onerror?.(event as ErrorEvent);
  }
}

function setup() {
  const workers: Array<FakeWorker> = [];
  const render = createPreviewRenderer(() => {
    const worker = new FakeWorker();
    workers.push(worker);
    return worker;
  });
  return { render, workers };
}

describe('renderPreviews', () => {
  it('starts no worker when there is nothing to render', async () => {
    const { render, workers } = setup();
    await expect(render({})).resolves.toEqual({});
    await expect(render({ a: null })).resolves.toEqual({ a: null });
    expect(workers).toHaveLength(0);
  });

  it('starts one worker and matches each reply to its request', async () => {
    const { render, workers } = setup();
    const first = render({ a: 'MOL A' });
    const second = render({ b: 'MOL B' }, { size: 80 });
    expect(workers).toHaveLength(1);
    expect(workers[0].posted).toEqual([
      { id: 0, molblocksById: { a: 'MOL A' }, size: 120 },
      { id: 1, molblocksById: { b: 'MOL B' }, size: 80 },
    ]);
    workers[0].reply({ id: 1, svgsById: { b: 'SVG B' } });
    workers[0].reply({ id: 0, svgsById: { a: 'SVG A' } });
    await expect(first).resolves.toEqual({ a: 'SVG A' });
    await expect(second).resolves.toEqual({ b: 'SVG B' });
  });

  it('rejects a request the worker could not render', async () => {
    const { render, workers } = setup();
    const request = render({ a: 'MOL A' });
    workers[0].reply({ id: 0, error: 'Indigo did not load' });
    await expect(request).rejects.toThrow('Indigo did not load');
  });

  it('rejects every pending request when the worker fails, and starts a new one next time', async () => {
    const { render, workers } = setup();
    const first = render({ a: 'MOL A' });
    const second = render({ b: 'MOL B' });
    workers[0].fail({ message: 'script error' });
    await expect(first).rejects.toThrow('script error');
    await expect(second).rejects.toThrow('script error');
    expect(workers[0].terminated).toBe(true);
    void render({ c: 'MOL C' });
    expect(workers).toHaveLength(2);
    expect(workers[1].posted).toEqual([
      { id: 2, molblocksById: { c: 'MOL C' }, size: 120 },
    ]);
  });

  it('names the failure when the error event carries no message', async () => {
    const { render, workers } = setup();
    const request = render({ a: 'MOL A' });
    // A worker script that fails to load reports a plain Event, which has no message.
    workers[0].fail({});
    await expect(request).rejects.toThrow('The preview worker failed');
  });

  it('rejects when the worker cannot be created', async () => {
    const render = createPreviewRenderer(() => {
      throw new ReferenceError('Worker is not defined');
    });
    await expect(render({ a: 'MOL A' })).rejects.toThrow('Worker is not defined');
  });

  it('ignores a reply with no pending request', () => {
    const { render, workers } = setup();
    void render({ a: 'MOL A' });
    expect(() => workers[0].reply({ id: 99, svgsById: {} })).not.toThrow();
  });
});

describe('the shared renderPreviews', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts one module worker over previews.worker.ts for every caller', () => {
    const started: Array<{ url: URL; options: WorkerOptions }> = [];
    class RecordingWorker extends FakeWorker {
      constructor(url: URL, options: WorkerOptions) {
        super();
        started.push({ url, options });
      }
    }
    vi.stubGlobal('Worker', RecordingWorker);
    void renderPreviews({ a: 'MOL A' });
    void renderPreviews({ b: 'MOL B' });
    expect(started).toHaveLength(1);
    expect(started[0].url.pathname).toMatch(/\/previews\.worker\.ts$/);
    expect(started[0].options).toEqual({ type: 'module' });
  });
});
