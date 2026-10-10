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
import type { UnknownAction } from '@reduxjs/toolkit';
import { reactionsReducer } from './reactions.reducer.ts';
import {
  addUpdateReactionFieldActions,
  createEmptyReactionActions,
  deleteReactionFieldActions,
  getReactionActions,
  getReactionPageActions,
  getReactionsListActions,
  importReactionFromFileActions,
  removeReactionActions,
  renameReactionActions,
  setShowInvalidOnly,
} from './reactions.actions.ts';
import {
  addUpdateVariableActions,
  getAllTemplatesActions,
  removeTemplateActions,
  removeVariableActions,
  renameTemplateActions,
} from 'store/entities/templates/templates.actions.ts';

type ReactionsState = ReturnType<typeof reactionsReducer>;

const initialState = (): ReactionsState =>
  reactionsReducer(undefined, { type: '@@INIT' } as UnknownAction);

// Helper to dispatch an action creator's output against (optionally seeded) state.
function reduce(
  state: Partial<ReactionsState> | undefined,
  action: unknown,
): ReactionsState {
  const base = { ...initialState(), ...state };
  return reactionsReducer(base, action as UnknownAction);
}

// Minimal reaction whose data linkReactionEntities can traverse (it maps over outcomes).
const reaction = (id: number, data: Record<string, unknown> = {}) => ({
  id,
  data: { outcomes: [], ...data },
});

// reactionsById entries are a Reaction|Template union; read nested fields through
// a single cast from unknown for assertions (not narrowable from the union).
interface EntryShape {
  pb_reaction_id?: string;
  data: {
    notes?: Record<string, unknown>;
    reactionId?: string;
    outcomes?: Array<unknown>;
  };
  dataBeforeEdit?: { notes?: Record<string, unknown> };
  variables: Record<string, unknown>;
}
const asEntry = (entry: unknown): EntryShape => entry as EntryShape;

describe('reactions.reducer — activeDatasetId', () => {
  it('tracks the datasetId from a single-reaction request', () => {
    const state = reduce(
      undefined,
      getReactionActions.request({ datasetId: 5, reactionId: 9 }),
    );
    expect(state.activeDatasetId).toBe(5);
  });

  it('tracks the datasetId from a reactions-list request', () => {
    const state = reduce(undefined, getReactionsListActions.request(7));
    expect(state.activeDatasetId).toBe(7);
  });
});

describe('reactions.reducer — list/page lifecycle', () => {
  it('clears order/pagination and flags loading on a list request', () => {
    const seeded = {
      reactionsOrder: [1, 2],
      areReactionsLoading: false,
      pagination: { ...initialState().pagination, total: 9, page: 4 },
    };
    const state = reduce(seeded, getReactionsListActions.request(3));
    expect(state.reactionsOrder).toEqual([]);
    expect(state.pagination).toEqual(initialState().pagination);
    expect(state.areReactionsLoading).toBe(true);
  });

  it('populates order, pagination, byId, and clears loading on a list success', () => {
    const payload = {
      items: [reaction(1), reaction(2)],
      total: 2,
      pages: 1,
      page: 1,
      size: 10,
    };
    const state = reduce(
      { areReactionsLoading: true },
      getReactionsListActions.success(payload as never),
    );
    expect(state.reactionsOrder).toEqual([1, 2]);
    expect(state.pagination).toMatchObject({ total: 2, pages: 1 });
    expect(Object.keys(state.reactionsById)).toEqual(['1', '2']);
    expect(state.areReactionsLoading).toBe(false);
  });

  it('merges the requested page into pagination and flags loading on a page request', () => {
    const state = reduce(
      undefined,
      getReactionPageActions.request({ page: 3, size: 20 } as never),
    );
    expect(state.pagination).toMatchObject({ page: 3, size: 20 });
    expect(state.areReactionsLoading).toBe(true);
  });
});

describe('reactions.reducer — create/remove', () => {
  it('flags creating on an empty-reaction request', () => {
    expect(
      reduce(undefined, createEmptyReactionActions.request()).isReactionCreating,
    ).toBe(true);
  });

  it('clears creating and bumps pagination total on an empty-reaction success', () => {
    const state = reduce(
      { pagination: { ...initialState().pagination, total: 4, size: 10 } },
      createEmptyReactionActions.success(reaction(99) as never),
    );
    expect(state.isReactionCreating).toBe(false);
    expect(state.pagination.total).toBe(5);
    expect(state.pagination.pages).toBe(1);
  });

  it('flags creating on an import request and clears it (bumping pagination total) on import success', () => {
    expect(
      reduce(undefined, importReactionFromFileActions.request({} as never))
        .isReactionCreating,
    ).toBe(true);
    const state = reduce(
      {
        isReactionCreating: true,
        pagination: { ...initialState().pagination, total: 4, size: 10 },
      },
      importReactionFromFileActions.success(reaction(99) as never),
    );
    expect(state.isReactionCreating).toBe(false);
    expect(state.pagination.total).toBe(5);
  });

  it('removes the reaction from byId/order and decrements pagination total', () => {
    const seeded = {
      reactionsById: { 1: reaction(1), 2: reaction(2) } as never,
      reactionsOrder: [1, 2],
      pagination: { ...initialState().pagination, total: 2, size: 10 },
    };
    const state = reduce(seeded, removeReactionActions.success(2));
    expect(Object.keys(state.reactionsById)).toEqual(['1']);
    expect(state.reactionsOrder).toEqual([1]);
    expect(state.pagination.total).toBe(1);
  });
});

describe('reactions.reducer — reactionsById field edits', () => {
  it('deep-merges a new value at a path on an add/update field request', () => {
    const seeded = { reactionsById: { 1: reaction(1, { notes: {} }) } as never };
    const action = addUpdateReactionFieldActions.request({
      reactionId: 1,
      pathComponents: ['notes', 'text'],
      newValue: 'hello',
    } as never);
    const state = reduce(seeded, action);
    expect(asEntry(state.reactionsById[1]).data.notes).toEqual({ text: 'hello' });
  });

  it('removes the value at a path on a delete field request', () => {
    const seeded = {
      reactionsById: { 1: reaction(1, { notes: { text: 'x' } }) } as never,
    };
    const action = deleteReactionFieldActions.request({
      reactionId: 1,
      pathComponents: ['notes', 'text'],
    } as never);
    const state = reduce(seeded, action);
    expect(asEntry(state.reactionsById[1]).data.notes).toEqual({});
  });

  it('renames a reaction, updating both pb_reaction_id and data.reactionId', () => {
    const seeded = {
      reactionsById: { 1: { ...reaction(1), pb_reaction_id: 'old' } } as never,
    };
    const state = reduce(
      seeded,
      renameReactionActions.success({ reactionId: 1, name: 'new-name' } as never),
    );
    expect(state.reactionsById[1]).toMatchObject({
      pb_reaction_id: 'new-name',
      data: { reactionId: 'new-name' },
    });
  });
});

describe('reactions.reducer — optimistic-edit rollback (#615)', () => {
  const seedNotes = (text: string) => ({
    reactionsById: { 1: reaction(1, { notes: { text } }) } as never,
  });

  it('snapshots the pre-edit data when an edit is dispatched', () => {
    const state = reduce(
      seedNotes('original'),
      deleteReactionFieldActions.request({
        reactionId: 1,
        pathComponents: ['notes', 'text'],
      } as never),
    );
    expect(asEntry(state.reactionsById[1]).data.notes).toEqual({});
    expect(asEntry(state.reactionsById[1]).dataBeforeEdit?.notes).toEqual({
      text: 'original',
    });
  });

  it('restores the snapshot and clears it when the backend rejects the edit', () => {
    const afterEdit = reduce(
      seedNotes('original'),
      deleteReactionFieldActions.request({
        reactionId: 1,
        pathComponents: ['notes', 'text'],
      } as never),
    );
    const afterFailure = reduce(
      afterEdit,
      deleteReactionFieldActions.failure('Access denied' as never),
    );
    expect(asEntry(afterFailure.reactionsById[1]).data.notes).toEqual({
      text: 'original',
    });
    expect(asEntry(afterFailure.reactionsById[1]).dataBeforeEdit).toBeUndefined();
  });

  it('clears the snapshot once the edit is committed', () => {
    const afterEdit = reduce(
      seedNotes('original'),
      addUpdateReactionFieldActions.request({
        reactionId: 1,
        pathComponents: ['notes', 'text'],
        newValue: 'edited',
      } as never),
    );
    expect(asEntry(afterEdit.reactionsById[1]).dataBeforeEdit).toBeDefined();
    // The real success payload (Omit<DatasetReaction, 'data'>) carries previews; the
    // reactionsPreviews slice also handles this action and indexes them.
    const afterSuccess = reduce(
      afterEdit,
      addUpdateReactionFieldActions.success({ id: 1, previews: {} } as never),
    );
    expect(asEntry(afterSuccess.reactionsById[1]).dataBeforeEdit).toBeUndefined();
    expect(asEntry(afterSuccess.reactionsById[1]).data.notes).toEqual({
      text: 'edited',
    });
  });

  it('keeps the earliest baseline across successive edits so a rollback reverts all the way', () => {
    const edit1 = reduce(
      seedNotes('original'),
      addUpdateReactionFieldActions.request({
        reactionId: 1,
        pathComponents: ['notes', 'text'],
        newValue: 'first',
      } as never),
    );
    const edit2 = reduce(
      edit1,
      addUpdateReactionFieldActions.request({
        reactionId: 1,
        pathComponents: ['notes', 'text'],
        newValue: 'second',
      } as never),
    );
    expect(asEntry(edit2.reactionsById[1]).data.notes).toEqual({ text: 'second' });
    expect(asEntry(edit2.reactionsById[1]).dataBeforeEdit?.notes).toEqual({
      text: 'original',
    });
  });

  it('is a no-op on failure when no edit is pending', () => {
    const seeded = seedNotes('x');
    const state = reduce(seeded, deleteReactionFieldActions.failure('err' as never));
    expect(asEntry(state.reactionsById[1]).data.notes).toEqual({ text: 'x' });
    expect(asEntry(state.reactionsById[1]).dataBeforeEdit).toBeUndefined();
  });
});

describe('reactions.reducer — templates', () => {
  it('indexes all templates by id on a get-all-templates success', () => {
    const templates = [
      { id: 't1', data: { outcomes: [] } },
      { id: 't2', data: { outcomes: [] } },
    ];
    const state = reduce(undefined, getAllTemplatesActions.success(templates as never));
    expect(Object.keys(state.reactionsById)).toEqual(['t1', 't2']);
  });

  it('removes the template_<id> entry on a remove-template success', () => {
    const seeded = {
      reactionsById: {
        template_5: { id: 'template_5' },
        template_6: { id: 'template_6' },
      } as never,
    };
    const state = reduce(seeded, removeTemplateActions.success(5 as never));
    expect(Object.keys(state.reactionsById)).toEqual(['template_6']);
  });

  it('replaces a template entry on a rename-template success', () => {
    const seeded = { reactionsById: { t1: { id: 't1', name: 'old' } } as never };
    const renamed = { id: 't1', name: 'renamed', data: { outcomes: [] } };
    const state = reduce(seeded, renameTemplateActions.success(renamed as never));
    expect(state.reactionsById.t1).toMatchObject({ name: 'renamed' });
  });

  it('adds a variable keyed by its dotted path on an add-variable request', () => {
    const seeded = { reactionsById: { t1: { id: 't1', variables: {} } } as never };
    const variable = { path: ['conditions', 'temperature'], name: 'temp' };
    const state = reduce(
      seeded,
      addUpdateVariableActions.request({ templateId: 't1', variable } as never),
    );
    expect(asEntry(state.reactionsById.t1).variables).toHaveProperty(
      'conditions.temperature',
    );
  });

  it('removes a variable by its dotted path on a remove-variable request', () => {
    const variable = { path: ['conditions', 'temperature'], name: 'temp' };
    const seeded = {
      reactionsById: {
        t1: { id: 't1', variables: { 'conditions.temperature': variable } },
      } as never,
    };
    const state = reduce(
      seeded,
      removeVariableActions.request({ templateId: 't1', variable } as never),
    );
    expect(asEntry(state.reactionsById.t1).variables).toEqual({});
  });
});

describe('reactions.reducer — showInvalidOnly', () => {
  it('reflects the setShowInvalidOnly payload', () => {
    expect(reduce(undefined, setShowInvalidOnly(true)).showInvalidOnly).toBe(true);
    expect(
      reduce({ showInvalidOnly: true }, setShowInvalidOnly(false)).showInvalidOnly,
    ).toBe(false);
  });

  it('resets to the default when a dataset loads, so the filter is per-dataset (#591)', () => {
    const state = reduce({ showInvalidOnly: true }, getReactionsListActions.request(7));
    expect(state.showInvalidOnly).toBe(false);
  });
});
