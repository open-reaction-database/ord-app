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
import { describe, it, expect } from 'vitest';
import { templateFromFileErrorReducer } from './templateFromFileError.reducer.ts';
import { importTemplateFromFileActions } from 'store/entities/templates/templates.actions.ts';

describe('templateFromFileErrorReducer', () => {
  it('starts with no error', () => {
    expect(templateFromFileErrorReducer(undefined, { type: '@@INIT' })).toBeNull();
  });

  it('records the failure message', () => {
    expect(
      templateFromFileErrorReducer(
        null,
        importTemplateFromFileActions.failure('bad file'),
      ),
    ).toBe('bad file');
  });

  it('clears the error when a new import starts', () => {
    expect(
      templateFromFileErrorReducer(
        'bad file',
        importTemplateFromFileActions.request({} as never),
      ),
    ).toBeNull();
  });
});
