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
import {
  ReactionProvider,
  usePreviews,
  useReactionPart,
  useReactionSnapshot,
  type ReactionActions,
  type ReactionSlots,
} from '@open-reaction-database/ui/reaction';
import type { AppState } from 'store/configureAppStore.ts';
import { rootReducer } from 'store/rootReducer.ts';
import axiosInstance from 'store/axiosInstance.ts';
import { emptyReactionData } from '@open-reaction-database/ui/testing';
import { deferred } from 'test/deferred.ts';
import {
  ordBinpbToReaction,
  ordInputToReaction,
} from '@open-reaction-database/ui/reaction/model';
import { create } from '@bufbuild/protobuf';
import { ReactionInputSchema } from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import {
  NotificationVariant,
  showNotification,
} from '@open-reaction-database/ui/display';
import type { User } from 'store/entities/users/users.types.ts';
import {
  addUpdateReactionFieldActions,
  deleteReactionFieldActions,
  getReactionsListActions,
  removeReactionActions,
} from './reactions.actions.ts';
import { setPreviewsByIds } from './reactionsPreviews/reactionsPreviews.actions.ts';
import { reduxReactionActions, reduxReactionSource } from './reduxReactionSource.ts';
import { renameReaction } from './reactions.thunks.ts';
import { SAVE_TIMEOUT_MS } from 'store/utils/saveQueue.ts';

vi.mock('store/axiosInstance.ts', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('@open-reaction-database/ui/display', async importActual => ({
  ...((await importActual()) as Record<string, unknown>),
  showNotification: vi.fn(),
}));

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

/** An input `in1` with one empty component `c1`, complete enough to save. */
function savableInput() {
  const input = ordInputToReaction(
    create(ReactionInputSchema, { components: [{}] }),
    'in1',
  );
  return { ...input, id: 'in1', components: [{ ...input.components[0], id: 'c1' }] };
}

/**
 * A store holding reactions 1, 2, and template_3, and `self` as the signed-in user;
 * `recorded`, if given, collects every action. Reaction 1 has an input `in1` with one
 * component.
 */
function makeStore(recorded?: Array<UnknownAction>, self?: Partial<User>) {
  const reaction = (id: number | string) => ({
    id,
    data:
      id === 1
        ? {
            ...emptyReactionData(),
            inputs: { in1: savableInput() },
          }
        : emptyReactionData(),
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
        users: { self: self ?? null },
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
    const actions = reduxReactionActions(store, 1);
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
      reduxReactionActions(store, 1).update(['notes'], {
        safetyNotes: 'gloves',
      }),
    ).resolves.toBeUndefined();
    expect(recorded.map(action => action.type)).toContain(
      addUpdateReactionFieldActions.failure.type,
    );
  });

  it.each([
    [
      'an update',
      (actions: ReactionActions) =>
        actions.update(['notes'], { safetyNotes: 'gloves' }),
    ],
    ['a removal', (actions: ReactionActions) => actions.remove(['inputs', 'in1'])],
  ])(
    'say so when the save of %s fails, and restore the reaction',
    async (_name, edit) => {
      axiosMock.patch.mockRejectedValue(new Error('offline'));
      const store = makeStore();
      const before = store.getState().entities.reactions.reactionsById[1].data;
      await edit(reduxReactionActions(store, 1));
      // The save reached the backend, so the failure is the request's.
      expect(axiosMock.patch).toHaveBeenCalled();
      expect(showNotification).toHaveBeenCalledTimes(1);
      expect(showNotification).toHaveBeenCalledWith({
        message: 'Failed to update reaction.',
        variant: NotificationVariant.ERROR,
      });
      expect(store.getState().entities.reactions.reactionsById[1].data).toEqual(before);
    },
  );

  it('show only the backend’s message when a failed save has one', async () => {
    axiosMock.patch.mockRejectedValue({
      isAxiosError: true,
      response: { data: { detail: 'Access forbidden' } },
    });
    await reduxReactionActions(makeStore(), 1).remove(['inputs', 'in1']);
    expect(showNotification).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledWith({
      message: 'Access forbidden',
      variant: NotificationVariant.ERROR,
    });
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
      {
        dispatch: dispatch as unknown as ThunkDispatch<AppState, never, Action>,
        getState: () => ({}) as AppState,
      },
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

describe('reduxReactionActions.addIdentifierByName', () => {
  const path = ['inputs', 'in1', 'components', 0, 'identifiers'];

  it('resolves the name and appends a SMILES identifier', async () => {
    const recorded: Array<UnknownAction> = [];
    const store = makeStore(recorded);
    axiosMock.post.mockResolvedValue({ data: { smiles: 'O' } });
    axiosMock.patch.mockResolvedValue({ data: {} });
    await expect(
      reduxReactionActions(store, 1).addIdentifierByName(path, 'water'),
    ).resolves.toBe(true);
    expect(axiosMock.post).toHaveBeenCalledWith('/resolve-compound', {
      identifier_type: 'name',
      identifier: 'water',
    });
    const request = recorded.find(addUpdateReactionFieldActions.request.match);
    expect(request?.payload.pathComponents).toEqual([...path, 0]);
    expect(request?.payload.newValue).toMatchObject({ value: 'O', details: 'water' });
  });

  it('appends after any identifier added while the name was resolving', async () => {
    const recorded: Array<UnknownAction> = [];
    const store = makeStore(recorded);
    axiosMock.post.mockImplementation(async () => {
      store.dispatch(
        addUpdateReactionFieldActions.request({
          reactionId: 1,
          pathComponents: [...path, 0],
          newValue: { id: 'meanwhile' },
        }),
      );
      return { data: { smiles: 'O' } };
    });
    // The save fails once the test is done with it, so it does not hold later saves.
    const save = deferred();
    axiosMock.patch.mockReturnValue(save.promise);
    const adding = reduxReactionActions(store, 1).addIdentifierByName(path, 'water');
    await new Promise(resolve => setTimeout(resolve, 0));
    const requests = recorded.filter(addUpdateReactionFieldActions.request.match);
    expect(requests.at(-1)?.payload.pathComponents).toEqual([...path, 1]);
    save.reject(new Error('done'));
    await adding;
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  it('resolves false and changes nothing when the name does not resolve', async () => {
    const recorded: Array<UnknownAction> = [];
    const store = makeStore(recorded);
    axiosMock.post.mockRejectedValue(new Error('not found'));
    await expect(
      reduxReactionActions(store, 1).addIdentifierByName(path, 'unobtainium'),
    ).resolves.toBe(false);
    expect(recorded.some(addUpdateReactionFieldActions.request.match)).toBe(false);
  });
});

describe('reduxReactionActions.currentPerson', () => {
  it('maps the signed-in user to a provenance person, skipping empty fields', () => {
    const store = makeStore(undefined, {
      name: 'Me',
      email: '',
      orcid_id: '0000-0001',
    });
    expect(reduxReactionActions(store, 1).currentPerson?.()).toEqual({
      name: 'Me',
      orcid: '0000-0001',
    });
  });

  it('returns undefined before the user loads', () => {
    expect(reduxReactionActions(makeStore(), 1).currentPerson?.()).toBeUndefined();
  });
});

describe('overlapping edits to one reaction', () => {
  /** A save the backend accepts. */
  const accepted = () => ({
    data: {
      id: 1,
      molblocks: { inputs: {}, outcomes: [], workups: [] },
      validation: null,
      summary: { provenance: {}, summary: {}, conditions: '' },
    },
  });
  const flush = () => new Promise(resolve => setTimeout(resolve, 0));
  const dataOf = (store: ReturnType<typeof makeStore>) =>
    store.getState().entities.reactions.reactionsById[1].data;

  it('save one after another, never at once', async () => {
    const firstSave = deferred();
    axiosMock.patch
      .mockReturnValueOnce(firstSave.promise)
      .mockResolvedValue(accepted());
    const store = makeStore();
    const actions = reduxReactionActions(store, 1);
    const first = actions.update(['notes'], { safetyNotes: 'gloves' });
    await flush();
    const second = actions.remove(['inputs', 'in1']);
    await flush();
    expect(axiosMock.patch).toHaveBeenCalledTimes(1);
    firstSave.resolve(accepted());
    await Promise.all([first, second]);
    expect(axiosMock.patch).toHaveBeenCalledTimes(2);
  });

  it('keep an earlier saved edit when a later one fails', async () => {
    const firstSave = deferred();
    axiosMock.patch
      .mockReturnValueOnce(firstSave.promise)
      .mockRejectedValueOnce(new Error('offline'));
    const store = makeStore();
    const actions = reduxReactionActions(store, 1);
    const first = actions.update(['notes'], { safetyNotes: 'gloves' });
    await flush();
    const second = actions.remove(['inputs', 'in1']);
    await flush();
    firstSave.resolve(accepted());
    await Promise.all([first, second]);
    expect(dataOf(store).notes.safetyNotes).toBe('gloves');
    expect(dataOf(store).inputs).toHaveProperty('in1');
  });

  it('drop later edits when an earlier save fails, without saving them', async () => {
    const firstSave = deferred();
    axiosMock.patch
      .mockReturnValueOnce(firstSave.promise)
      .mockResolvedValue(accepted());
    const store = makeStore();
    const before = dataOf(store);
    const actions = reduxReactionActions(store, 1);
    const first = actions.update(['notes'], { safetyNotes: 'gloves' });
    await flush();
    const second = actions.remove(['inputs', 'in1']);
    await flush();
    firstSave.reject(new Error('offline'));
    await Promise.all([first, second]);
    expect(dataOf(store)).toEqual(before);
    expect(axiosMock.patch).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledTimes(1);
  });

  it('save once for edits made before the first save starts', async () => {
    axiosMock.patch.mockResolvedValue(accepted());
    const store = makeStore();
    const actions = reduxReactionActions(store, 1);
    await Promise.all([
      actions.update(['notes'], { safetyNotes: 'gloves' }),
      actions.remove(['inputs', 'in1']),
    ]);
    expect(axiosMock.patch).toHaveBeenCalledTimes(1);
    expect(dataOf(store).notes.safetyNotes).toBe('gloves');
    expect(dataOf(store).inputs).not.toHaveProperty('in1');
  });

  it('rename only after a pending save settles', async () => {
    const firstSave = deferred();
    axiosMock.patch
      .mockReturnValueOnce(firstSave.promise)
      .mockResolvedValue(accepted());
    const store = makeStore();
    const edit = reduxReactionActions(store, 1).update(['notes'], {
      safetyNotes: 'gloves',
    });
    await flush();
    const rename = store.dispatch(
      renameReaction({ reactionId: 1, name: 'renamed' }) as unknown as UnknownAction,
    );
    await flush();
    expect(axiosMock.patch).toHaveBeenCalledTimes(1);
    firstSave.resolve(accepted());
    await Promise.all([edit, rename]);
    expect(axiosMock.patch).toHaveBeenCalledTimes(2);
  });

  /** The reaction a PATCH sent, decoded from its body. */
  const sentReaction = (call: number) =>
    ordBinpbToReaction(
      (axiosMock.patch.mock.calls[call][1] as { binpb: string }).binpb,
    );

  it('send the new name with an edit made while a rename is saving', async () => {
    const renaming = deferred();
    axiosMock.patch.mockReturnValueOnce(renaming.promise).mockResolvedValue(accepted());
    const store = makeStore();
    const rename = store.dispatch(
      renameReaction({ reactionId: 1, name: 'renamed' }) as unknown as UnknownAction,
    );
    await flush();
    const edit = reduxReactionActions(store, 1).update(['notes'], {
      safetyNotes: 'gloves',
    });
    await flush();
    renaming.resolve({});
    await Promise.all([rename, edit]);
    expect(axiosMock.patch).toHaveBeenCalledTimes(2);
    expect(sentReaction(1).reactionId).toBe('renamed');
  });

  it('keep the edits a rename sent when a later save fails', async () => {
    const firstSave = deferred();
    const renaming = deferred();
    axiosMock.patch
      .mockReturnValueOnce(firstSave.promise)
      .mockReturnValueOnce(renaming.promise)
      .mockRejectedValueOnce(new Error('offline'));
    const store = makeStore();
    const actions = reduxReactionActions(store, 1);
    const first = actions.update(['notes'], { safetyNotes: 'gloves' });
    await flush();
    const rename = store.dispatch(
      renameReaction({ reactionId: 1, name: 'renamed' }) as unknown as UnknownAction,
    );
    const second = actions.update(['notes'], { procedureDetails: 'stir' });
    await flush();
    firstSave.resolve(accepted());
    await flush();
    const third = actions.remove(['inputs', 'in1']);
    await flush();
    renaming.resolve({});
    await Promise.all([first, rename, second, third]);
    // The rename sent the second edit, so the failed third save keeps it and the name.
    expect(dataOf(store).notes.procedureDetails).toBe('stir');
    expect(dataOf(store).reactionId).toBe('renamed');
    expect(dataOf(store).inputs).toHaveProperty('in1');
  });

  it('save to the dataset that was open when the edit was made', async () => {
    const firstSave = deferred();
    axiosMock.patch
      .mockReturnValueOnce(firstSave.promise)
      .mockResolvedValue(accepted());
    const store = makeStore();
    store.dispatch(getReactionsListActions.request(5));
    const actions = reduxReactionActions(store, 1);
    const first = actions.update(['notes'], { safetyNotes: 'gloves' });
    await flush();
    const second = actions.remove(['inputs', 'in1']);
    await flush();
    store.dispatch(getReactionsListActions.request(9));
    firstSave.resolve(accepted());
    await Promise.all([first, second]);
    expect(axiosMock.patch.mock.calls.map(([url]) => url)).toEqual([
      'datasets/5/reactions/1',
      'datasets/5/reactions/1',
    ]);
  });

  it('do not wait on another store’s saves', async () => {
    axiosMock.patch
      .mockReturnValueOnce(deferred().promise)
      .mockResolvedValue(accepted());
    void reduxReactionActions(makeStore(), 1).update(['notes'], { safetyNotes: 'a' });
    await flush();
    await reduxReactionActions(makeStore(), 1).update(['notes'], { safetyNotes: 'b' });
    expect(axiosMock.patch).toHaveBeenCalledTimes(2);
  });

  it('end quietly when the reaction is removed while they wait', async () => {
    const firstSave = deferred();
    axiosMock.patch
      .mockReturnValueOnce(firstSave.promise)
      .mockResolvedValue(accepted());
    const store = makeStore();
    const actions = reduxReactionActions(store, 1);
    const first = actions.update(['notes'], { safetyNotes: 'gloves' });
    await flush();
    const second = actions.remove(['inputs', 'in1']);
    await flush();
    store.dispatch(removeReactionActions.success(1));
    firstSave.resolve(accepted());
    await Promise.all([first, second]);
    expect(showNotification).not.toHaveBeenCalledWith(
      expect.objectContaining({ variant: NotificationVariant.ERROR }),
    );
    expect(axiosMock.patch).toHaveBeenCalledTimes(1);
  });

  it('give up on a save after the save timeout', async () => {
    axiosMock.patch.mockResolvedValue(accepted());
    await reduxReactionActions(makeStore(), 1).update(['notes'], {
      safetyNotes: 'gloves',
    });
    expect(axiosMock.patch).toHaveBeenCalledWith(
      'datasets/0/reactions/1',
      expect.anything(),
      { timeout: SAVE_TIMEOUT_MS },
    );
  });
});
