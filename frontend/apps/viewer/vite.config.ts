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
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

// Where the dev server and `vite preview` send /api: the viewer's backend, served on
// 8001 as CLAUDE.md shows. In the image, nginx proxies /api instead.
const API_TARGET = process.env.ORD_VIEWER_API ?? 'http://127.0.0.1:8001';

export default defineConfig({
  plugins: [react(), svgr()],
  // Ketcher, which the shared package's structure dialog loads, reads process.env.
  define: {
    'process.env': {},
  },
  // The dev server pre-bundles the dependencies it finds by crawling these entries. The
  // shared package's preview worker is listed because the crawl from index.html does not
  // follow `new Worker(...)`, and a dependency found only when the worker loads makes the
  // server reload every page.
  optimizeDeps: {
    entries: ['index.html', '../../packages/ui/src/**/*.worker.ts'],
  },
  server: { port: 5174, strictPort: true, proxy: { '/api': API_TARGET } },
  preview: { port: 4174, strictPort: true, proxy: { '/api': API_TARGET } },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    // Before each test, reset every mock: its calls, and any implementation or queued
    // mock*Once value a test set. A vi.fn(impl) goes back to impl.
    mockReset: true,
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/test/**',
        'src/main.tsx',
        // Generated, and types only.
        'src/api/schema.ts',
      ],
      // Floors at the measured coverage, rounded down.
      thresholds: {
        lines: 97,
        statements: 97,
        branches: 100,
        functions: 97,
      },
    },
  },
});
