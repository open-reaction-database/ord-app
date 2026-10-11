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
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDrawerStack } from '#reaction/provider/reactionProvider.hooks.ts';
import { reactionWrapper, stubReactionActions } from '#testing/renderWithReaction.tsx';
import { buildUseCreate } from './buildUseCreate.ts';

interface NewEntity {
  entity: string;
}

const actions = stubReactionActions();
const wrapper = reactionWrapper({
  reactionId: 7,
  actions,
  pathComponents: ['inputs', 0],
});

const createKey = vi.fn(
  (
    _index: number,
    _list: Array<NewEntity>,
    _info?: Partial<NewEntity>,
  ): [string, NewEntity] => ['key1', { entity: 'new' }],
);

function renderCreate(
  entityName: string | Array<string | number>,
  shouldOpenSidebar?: boolean,
) {
  const useCreate = buildUseCreate<NewEntity>(entityName, createKey, shouldOpenSidebar);
  const { result } = renderHook(
    () => ({ create: useCreate(), stack: useDrawerStack() }),
    { wrapper },
  );
  return result;
}

describe('buildUseCreate', () => {
  it('calls the key factory, saves the new entity, and opens the drawer at the composed path', () => {
    const result = renderCreate('components');
    act(() => result.current.create(0, [], { entity: 'seed' }));

    expect(createKey).toHaveBeenCalledWith(0, [], { entity: 'seed' });
    expect(actions.update).toHaveBeenCalledWith(['inputs', 0, 'components', 'key1'], {
      entity: 'new',
    });
    expect(result.current.stack).toEqual([['inputs', 0, 'components', 'key1']]);
  });

  it('appends an array entityName verbatim to the context path (and opens the sidebar there)', () => {
    const result = renderCreate(['conditions', 'temperature']);
    act(() => result.current.create(0, []));
    expect(actions.update).toHaveBeenCalledWith(
      ['inputs', 0, 'conditions', 'temperature', 'key1'],
      { entity: 'new' },
    );
    expect(result.current.stack).toEqual([
      ['inputs', 0, 'conditions', 'temperature', 'key1'],
    ]);
  });

  it('does not open the sidebar when shouldOpenSidebar is false', () => {
    const result = renderCreate('components', false);
    act(() => result.current.create(0, []));
    expect(actions.update).toHaveBeenCalledTimes(1);
    expect(result.current.stack).toEqual([]);
  });
});
