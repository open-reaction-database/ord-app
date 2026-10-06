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
import { loadEnv } from 'vite';
import { defineConfig, type ViteUserConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const AUTH0_VARIABLES = [
  'VITE_AUTH0_DOMAIN',
  'VITE_AUTH0_CLIENT_ID',
  'VITE_AUTH0_AUDIENCE',
  'VITE_AUTH0_ISSUER',
  'VITE_AUTH0_SCOPE',
];

// The Auth0 settings are compiled into the bundle, and a bundle built without them sends
// every visitor to https://undefined/authorize. Image builds (Dockerfile.single) set
// ORD_APP_REQUIRE_AUTH0 so they fail instead.
function assertAuth0Configured(mode: string): void {
  if (process.env.ORD_APP_REQUIRE_AUTH0 !== 'true') {
    return;
  }
  const env = loadEnv(mode, process.cwd(), 'VITE_AUTH0_');
  const missing = AUTH0_VARIABLES.filter(name => !env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Missing ${missing.join(', ')}: pass them as build arguments or set them in ui/.env ` +
        '(see ui/.env.template).',
    );
  }
}

// https://vite.dev/config/
const config: ViteUserConfig = {
  plugins: [react(), svgr(), tsconfigPaths()],
  worker: {
    plugins: () => [tsconfigPaths()],
  },
  // Because ketcher needs asserts which requires super outdated package util
  define: {
    'process.env': {},
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    // Unit tests live under src/; e2e/ is Playwright (run via `npm run test:e2e`), not vitest.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      // text/text-summary -> console; html + lcov -> uploaded artifacts; json-summary -> CI step summary.
      reporter: ['text', 'text-summary', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/test/**',
        'src/**/*.module.scss',
      ],
      // Total-coverage floor enforced in CI (a regression backstop). Set a few points below
      // current (lines 71%, statements 71%, branches 61%, functions 64%) so routine churn
      // doesn't trip it; ratchet up later.
      thresholds: {
        lines: 60,
        statements: 60,
        branches: 57,
        functions: 60,
      },
    },
  },
  preview: {
    port: 5173,
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
};

export default defineConfig(({ mode }) => {
  assertAuth0Configured(mode);
  return config;
});
