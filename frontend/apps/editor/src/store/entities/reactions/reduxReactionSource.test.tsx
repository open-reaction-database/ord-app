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
  configureStore,
  type Action,
  type Middleware,
  type ThunkDispatch,
  type UnknownAction,
} from '@reduxjs/toolkit';
import { act, render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ReactionProvider } from 'features/reactions/provider/ReactionProvider.tsx';
import {
  usePreviews,
  useReactionPart,
  useReactionSnapshot,
} from 'features/reactions/provider/reactionProvider.hooks.ts';
import type { ReactionSlots } from 'features/reactions/provider/reactionProvider.types.ts';
import type { AppState } from 'store/configureAppStore.ts';
import { rootReducer } from 'store/rootReducer.ts';
import axiosInstance from 'store/axiosInstance.ts';
import { emptyReactionData } from 'test/renderInReactionView.tsx';
import {
  addUpdateReactionFieldActions,
  deleteReactionFieldActions,
} from './reactions.actions.ts';
import { setPreviewsByIds } from './reactionsPreviews/reactionsPreviews.actions.ts';
import { reduxReactionActions, reduxReactionSource } from './reduxReactionSource.ts';

vi.mock('store/axiosInstance.ts', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));

// axios methods are overloaded, so vi.mocked() doesn't surface the mock helpers under tsc.
const axiosMock = axiosInstance as unknown as Record<
  'get' | 'post' | 'patch' | 'delete',
  ReturnType<typeof vi.fn>
>;

const Empty = () => null;
const slots: ReactionSlots = {
  ViewDeleteButtons: Empty,
  ValueLabel: Empty,
  ViewOnlyLabel: Empty,
};

/** A store holding reactions 1, 2, and template_3; `recorded`, if given, collects every action. */
function makeStore(recorded?: Array<UnknownAction>) {
  const reaction = (id: number | string) => ({
    id,
    data: emptyReactionData(),
    previews: {},
    summary: { provenance: {}, summary: {}, conditions: '' },
  });
  const recorder: Middleware = () => next => action => {
    recorded?.push(action as UnknownAction);
    return next(action);
  };
  return configureStore({
    reducer: rootReducer,
    middleware: getDefault => getDefault().concat(recorder),
    preloadedState: {
      entities: {
        reactions: {
          reactionsById: {
            1: reaction(1),
            2: reaction(2),
            template_3: reaction('template_3'),
          },
        },
      },
    } as unknown as AppState,
  });
}

describe('reduxReactionSource', () => {
  it('returns the stored reaction, the same object until it changes', () => {
    const store = makeStore();
    const source = reduxReactionSource(store, 1);
    const before = source.getSnapshot();
    expect(before).toBe(store.getState().entities.reactions.reactionsById[1]);
    store.dispatch(
      addUpdateReactionFieldActions.request({
        reactionId: 2,
        pathComponents: ['notes'],
        newValue: { safetyNotes: 'unrelated' },
      }),
    );
    expect(source.getSnapshot()).toBe(before);
    store.dispatch(
      addUpdateReactionFieldActions.request({
        reactionId: 1,
        pathComponents: ['notes'],
        newValue: { safetyNotes: 'gloves' },
      }),
    );
    expect(source.getSnapshot()).not.toBe(before);
  });

  it('reads templates by their string IDs', () => {
    const store = makeStore();
    expect(reduxReactionSource(store, 'template_3').getSnapshot()?.data).toBeDefined();
  });

  it('notifies subscribers when the store changes, and stops after unsubscribing', () => {
    const store = makeStore();
    const listener = vi.fn();
    const unsubscribe = reduxReactionSource(store, 1).subscribe(listener);
    store.dispatch(setPreviewsByIds({ a: 'A' }));
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    store.dispatch(setPreviewsByIds({ b: 'B' }));
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('hooks over the Redux source', () => {
  function setup(reactionId: number | string = 1) {
    const store = makeStore();
    const source = reduxReactionSource(store, reactionId);
    const target =
      typeof reactionId === 'string'
        ? { reactionId, isTemplate: true as const }
        : { reactionId };
    function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
      return (
        <ReactionProvider
          {...target}
          source={source}
          slots={slots}
        >
          {children}
        </ReactionProvider>
      );
    }
    return { store, wrapper: Wrapper };
  }

  it('match the static source for the same snapshot', () => {
    const { store, wrapper } = setup();
    const stored = store.getState().entities.reactions.reactionsById[1];
    expect(renderHook(useReactionSnapshot, { wrapper }).result.current).toBe(stored);
    expect(
      renderHook(() => useReactionPart(['notes']), { wrapper }).result.current,
    ).toBe(stored.data.notes);
  });

  it('update when previews arrive after the first render', () => {
    const { store, wrapper } = setup();
    const { result } = renderHook(() => usePreviews(['a']), { wrapper });
    expect(result.current).toEqual({ a: undefined });
    act(() => {
      store.dispatch(setPreviewsByIds({ a: 'A' }));
    });
    expect(result.current).toEqual({ a: { isLoading: false, svg: 'A' } });
  });

  it('do not re-render a part reader when another reaction changes', () => {
    const { store, wrapper } = setup();
    let renders = 0;
    function NotesReader() {
      renders += 1;
      useReactionPart(['notes']);
      return null;
    }
    render(<NotesReader />, { wrapper });
    const rendersAfterMount = renders;
    act(() => {
      store.dispatch(
        addUpdateReactionFieldActions.request({
          reactionId: 2,
          pathComponents: ['notes'],
          newValue: { safetyNotes: 'unrelated' },
        }),
      );
    });
    expect(renders).toBe(rendersAfterMount);
  });

  it('work for a template', () => {
    const { wrapper } = setup('template_3');
    expect(
      renderHook(useReactionSnapshot, { wrapper }).result.current?.data,
    ).toBeDefined();
  });
});

describe('reduxReactionActions', () => {
  it('request the field update and the delete for their own reaction', async () => {
    const recorded: Array<UnknownAction> = [];
    const store = makeStore(recorded);
    const actions = reduxReactionActions(store.dispatch, 1);
    await actions.update(['notes'], { safetyNotes: 'gloves' });
    await actions.remove(['notes', 'safetyNotes']);
    const requestTypes = new Set([
      addUpdateReactionFieldActions.request.type,
      deleteReactionFieldActions.request.type,
    ]);
    expect(recorded.filter(action => requestTypes.has(action.type))).toEqual([
      addUpdateReactionFieldActions.request({
        reactionId: 1,
        pathComponents: ['notes'],
        newValue: { safetyNotes: 'gloves' },
      }),
      deleteReactionFieldActions.request({
        reactionId: 1,
        pathComponents: ['notes', 'safetyNotes'],
      }),
    ]);
  });

  it('resolve when the save fails, after dispatching the failure', async () => {
    axiosMock.patch.mockRejectedValue(new Error('offline'));
    const recorded: Array<UnknownAction> = [];
    const store = makeStore(recorded);
    await expect(
      reduxReactionActions(store.dispatch, 1).update(['notes'], {
        safetyNotes: 'gloves',
      }),
    ).resolves.toBeUndefined();
    expect(recorded.map(action => action.type)).toContain(
      addUpdateReactionFieldActions.failure.type,
    );
  });

  it('settle when the dispatched thunk does', async () => {
    let finish: () => void = () => undefined;
    const dispatch = vi.fn(
      () =>
        new Promise<void>(resolve => {
          finish = resolve;
        }),
    );
    const actions = reduxReactionActions(
      dispatch as unknown as ThunkDispatch<AppState, never, Action>,
      1,
    );
    let settled = false;
    const pending = actions.update(['notes'], { safetyNotes: 'gloves' }).then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    finish();
    await pending;
    expect(settled).toBe(true);
  });
});
