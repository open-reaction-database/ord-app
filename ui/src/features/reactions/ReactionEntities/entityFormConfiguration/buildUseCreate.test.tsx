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
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { reactionContext } from 'features/reactions/reactions.context.ts';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import type { ReactionsContext } from 'features/reactions/reactions.types.ts';

const dispatch = vi.hoisted(() => vi.fn());
vi.mock('store/useAppDispatch.ts', () => ({ useAppDispatch: () => dispatch }));
vi.mock('store/entities/reactions/reactions.thunks.ts', () => ({
  addUpdateReactionField: (payload: unknown) => ({
    type: 'addUpdateReactionField',
    payload,
  }),
}));
vi.mock('store/features/reactionForm/reactionForm.actions.ts', () => ({
  addReactionPathComponentToList: (payload: unknown) => ({
    type: 'addReactionPathComponentToList',
    payload,
  }),
}));

import { buildUseCreate } from './buildUseCreate.ts';

interface NewEntity {
  entity: string;
}

const reactionCtxValue: ReactionsContext = {
  reactionId: 7,
  isTemplate: false,
  isViewOnly: false,
  ViewDeleteButtonsComponent: () => null,
  ValueLabelComponent: () => null,
  ViewOnlyLabelComponent: () => null,
};

function ContextWrapper({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <reactionContext.Provider value={reactionCtxValue}>
      <reactionEntityContext.Provider
        value={{ reactionId: 7, pathComponents: ['inputs', 0] }}
      >
        {children}
      </reactionEntityContext.Provider>
    </reactionContext.Provider>
  );
}

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
  const { result } = renderHook(
    () => buildUseCreate<NewEntity>(entityName, createKey, shouldOpenSidebar)(),
    {
      wrapper: ContextWrapper,
    },
  );
  return result.current;
}

afterEach(() => {
  dispatch.mockClear();
  createKey.mockClear();
});

describe('buildUseCreate', () => {
  it('calls the key factory and dispatches the field update + sidebar open at the composed path', () => {
    const create = renderCreate('components');
    create(0, [], { entity: 'seed' });

    expect(createKey).toHaveBeenCalledWith(0, [], { entity: 'seed' });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'addUpdateReactionField',
      payload: {
        reactionId: 7,
        pathComponents: ['inputs', 0, 'components', 'key1'],
        newValue: { entity: 'new' },
      },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'addReactionPathComponentToList',
      payload: ['inputs', 0, 'components', 'key1'],
    });
  });

  it('appends an array entityName verbatim to the context path (and opens the sidebar there)', () => {
    renderCreate(['conditions', 'temperature'])(0, []);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'addUpdateReactionField',
      payload: {
        reactionId: 7,
        pathComponents: ['inputs', 0, 'conditions', 'temperature', 'key1'],
        newValue: { entity: 'new' },
      },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'addReactionPathComponentToList',
      payload: ['inputs', 0, 'conditions', 'temperature', 'key1'],
    });
  });

  it('does not open the sidebar when shouldOpenSidebar is false', () => {
    renderCreate('components', false)(0, []);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'addUpdateReactionField' }),
    );
  });
});
