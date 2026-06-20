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
import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import sonarjs from 'eslint-plugin-sonarjs';

export default tseslint.config(
  { ignores: ['dist'] },
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
      'no-relative-import-paths': noRelativeImportPaths,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/prop-types': 'off',
      'react/prefer-read-only-props': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-namespace': ['off'],
      complexity: ['error', 10],
      'no-duplicate-imports': 'error',
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        { allowSameFolder: true, rootDir: 'src', allowedDepth: 2 },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true, varsIgnorePattern: '^_', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
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
      'import/resolver': {
        node: {
          moduleDirectory: ['node_modules', 'src/'],
        },
      },
      react: {
        version: 'detect',
      },
    },
  },
);
