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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ordTemplateVariablesToReaction, reactionTemplateVariablesToOrd } from './templates.converters.ts';
import { replaceNameIdInReactionComponentPath } from '../../utils/replaceNameIdInReactionComponentPath.ts';
import { showNotification } from 'common/utils/showNotification.tsx';
import { NotificationVariant } from 'common/types/notification.ts';
import { VariableType, type Variable } from './templates.types.ts';
import type { AppReaction } from '../reactions/reactions.types.ts';

vi.mock('../../utils/replaceNameIdInReactionComponentPath.ts', () => ({
  replaceNameIdInReactionComponentPath: vi.fn(),
}));
vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));

const replaceMock = vi.mocked(replaceNameIdInReactionComponentPath);
const notifyMock = vi.mocked(showNotification);
const reaction = {} as AppReaction;
const variable = (name: string, path: Array<string>): Variable => ({
  name,
  field: 'f',
  type: VariableType.String,
  path,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

describe('ordTemplateVariablesToReaction', () => {
  it('rewrites each variable path and keys the result by the joined path', () => {
    replaceMock.mockReturnValue(['a', 'b']);
    const result = ordTemplateVariablesToReaction([variable('v1', ['orig'])], reaction);
    expect(replaceMock).toHaveBeenCalledWith(['orig'], reaction, 'id');
    expect(result).toEqual({ 'a.b': { name: 'v1', field: 'f', type: VariableType.String, path: ['a', 'b'] } });
  });

  it('skips an invalid variable and surfaces an error notification', () => {
    replaceMock.mockImplementation(() => {
      throw new Error('bad path');
    });
    const result = ordTemplateVariablesToReaction([variable('v1', ['orig'])], reaction);
    expect(result).toEqual({});
    expect(notifyMock).toHaveBeenCalledWith(
      expect.objectContaining({ variant: NotificationVariant.ERROR, message: 'Variable v1 is invalid' }),
    );
  });
});

describe('reactionTemplateVariablesToOrd', () => {
  it('rewrites each variable path back to names and returns an array', () => {
    replaceMock.mockReturnValue(['name', 'path']);
    const result = reactionTemplateVariablesToOrd({ k1: variable('v1', ['x']) }, reaction);
    expect(replaceMock).toHaveBeenCalledWith(['x'], reaction, 'name');
    expect(result).toEqual([{ name: 'v1', field: 'f', type: VariableType.String, path: ['name', 'path'] }]);
  });

  it('drops invalid variables and notifies', () => {
    replaceMock.mockImplementation(() => {
      throw new Error('bad path');
    });
    expect(reactionTemplateVariablesToOrd({ k1: variable('v1', ['x']) }, reaction)).toEqual([]);
    expect(notifyMock).toHaveBeenCalledTimes(1);
  });
});
