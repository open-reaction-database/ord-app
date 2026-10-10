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
import path from 'node:path';
import js from '@eslint/js';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import sonarjs from 'eslint-plugin-sonarjs';

export default tseslint.config(
  { ignores: ['**/dist', '**/coverage', '**/playwright-report', '**/test-results'] },
  {
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      prettier,
      ...tseslint.configs.recommended,
      sonarjs.configs.recommended,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react: react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/prop-types': 'off',
      'react/prefer-read-only-props': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-namespace': ['off'],
      complexity: ['error', 10],
      'no-duplicate-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
      // eslint-plugin-sonarjs (recommended) replaces SonarCloud's JS/TS bug & code-smell
      // analysis locally. A handful of its rules are redundant or fight this project's
      // established idioms, so they are turned off here (the other ~260 stay active):
      'sonarjs/no-unused-vars': 'off', // redundant with @typescript-eslint/no-unused-vars (configured above with the project's ignore patterns)
      'sonarjs/todo-tag': 'off', // TODO/FIXME comments are a legitimate tracking practice here, not a defect
      'sonarjs/void-use': 'off', // the project intentionally `void`s fire-and-forget promises (pairs with no-floating-promises); flagging that is counterproductive
      'sonarjs/no-ignored-exceptions': 'off', // deliberate best-effort `catch (_e)` fallbacks; the unused binding is already enforced via caughtErrorsIgnorePattern
      'sonarjs/assertions-in-tests': 'off', // false-positives on custom assertion helpers (e.g. expectNotified), which this suite uses heavily
      'sonarjs/no-nested-conditional': 'off', // nested ternaries are the idiomatic JSX conditional-render pattern; the rule can't scope itself to non-JSX
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['apps/editor/**/*.{ts,tsx}'],
    plugins: { 'no-relative-import-paths': noRelativeImportPaths },
    rules: {
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        { allowSameFolder: true, rootDir: 'apps/editor/src', allowedDepth: 2 },
      ],
    },
  },
  {
    files: ['packages/ui/**/*.{ts,tsx}'],
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({ project: 'packages/ui/tsconfig.json' }),
      ],
    },
    rules: {
      // Every import must be declared in the package's own package.json; hoisting would
      // otherwise let an undeclared dependency resolve from the workspace root.
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          packageDir: [path.join(import.meta.dirname, 'packages/ui')],
          devDependencies: [
            '**/*.test.{ts,tsx}',
            '**/testing/**',
            '**/vitest.config.ts',
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['../*'], message: 'Import package files through #… instead.' },
            {
              group: ['react-redux', '@reduxjs/toolkit', 'axios', '@auth0/*', 'wouter'],
              message:
                'The shared package stays free of app state, transport, and routing.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@open-reaction-database/ui/src/*', '**/packages/ui/*'],
              message: 'Import the shared package only through its exports.',
            },
          ],
        },
      ],
    },
  },
);
