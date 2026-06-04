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
import { vi } from 'vitest';

/** A recorded Worker instance: posted messages plus the handlers the middleware assigns. */
export interface CapturedWorker {
  postMessage: ReturnType<typeof vi.fn>;
  onmessage: ((event: { data: unknown }) => void) | null;
  onerror: ((error: unknown) => void) | null;
}

/**
 * Replace the global Worker constructor with a recorder for worker-middleware tests.
 *
 * Worker (and module workers via `new URL(..., import.meta.url)`) can't run under
 * vitest, so the stub records each instance the code under test constructs and
 * exposes its postMessage spy plus the onmessage/onerror handlers the middleware
 * assigns. Pair with `vi.unstubAllGlobals()` in afterEach to restore the global.
 *
 * Returns:
 *   The array that captures Worker instances in construction order.
 */
export function stubWorker(): Array<CapturedWorker> {
  const workers: Array<CapturedWorker> = [];
  class MockWorker {
    postMessage = vi.fn();
    onmessage: CapturedWorker['onmessage'] = null;
    onerror: CapturedWorker['onerror'] = null;
    constructor() {
      workers.push(this);
    }
  }
  vi.stubGlobal('Worker', MockWorker);
  return workers;
}
