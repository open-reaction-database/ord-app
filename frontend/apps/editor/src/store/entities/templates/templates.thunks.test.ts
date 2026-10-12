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
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { type UnknownAction } from '@reduxjs/toolkit';
import axiosInstance from 'store/axiosInstance.ts';
import { makeRecordingStore } from 'test/recordingStore.ts';
import { navigate } from 'wouter/use-browser-location';
import {
  addUpdateVariable,
  importFromFile,
  removeTemplate,
  renameTemplate,
} from './templates.thunks.ts';
import {
  getAllTemplatesActions,
  removeTemplateActions,
  importTemplateFromFileActions,
} from './templates.actions.ts';
import {
  NotificationVariant,
  showNotification,
} from '@open-reaction-database/ui/display';
import { emptyReactionData } from '@open-reaction-database/ui/testing';

vi.mock('store/axiosInstance.ts', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('wouter/use-browser-location', () => ({ navigate: vi.fn() }));
vi.mock('@open-reaction-database/ui/display', async importActual => ({
  ...((await importActual()) as Record<string, unknown>),
  showNotification: vi.fn(),
}));

const axiosMock = axiosInstance as unknown as Record<
  'get' | 'post' | 'patch' | 'delete',
  ReturnType<typeof vi.fn>
>;

beforeEach(() => {
  axiosMock.delete.mockResolvedValue({ data: {} });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('removeTemplate', () => {
  it('parses the numeric id, deletes the template, dispatches success, and navigates to the list', async () => {
    const { store, types } = makeRecordingStore();
    await store.dispatch(removeTemplate('template_5') as unknown as UnknownAction);

    expect(axiosMock.delete).toHaveBeenCalledWith('/templates/5');
    expect(types()).toContain(removeTemplateActions.success.type);
    expect(navigate).toHaveBeenCalledWith('/templates');
  });

  it('drops the template from the store and the template list', async () => {
    const { store } = makeRecordingStore();
    store.dispatch(
      getAllTemplatesActions.success([
        { id: 'template_5', name: 'gone', data: emptyReactionData(), variables: {} },
        { id: 'template_6', name: 'kept', data: emptyReactionData(), variables: {} },
      ] as never),
    );
    await store.dispatch(removeTemplate('template_5') as unknown as UnknownAction);
    const { entities } = store.getState();
    expect(Object.keys(entities.reactions.reactionsById)).toEqual(['template_6']);
    expect(entities.templates.templatesOrder).toEqual(['template_6']);
  });
});

describe('importFromFile', () => {
  it('dispatches failure (and never POSTs) when the file variables are not an array', async () => {
    // The production catch logs the parse error; silence it so the failure test stays quiet in CI.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const file = new File(
      [JSON.stringify({ binpb: 'AA==', variables: 'not-an-array' })],
      't.json',
      {
        type: 'application/json',
      },
    );
    const { store, actions, types } = makeRecordingStore();
    await store.dispatch(
      importFromFile({ name: 'T', file }) as unknown as UnknownAction,
    );

    expect(types()).toContain(importTemplateFromFileActions.failure.type);
    const failure = actions().find(
      a => a.type === importTemplateFromFileActions.failure.type,
    ) as { payload?: string };
    expect(failure?.payload).toBe('Incorrect template file provided');
    expect(axiosMock.post).not.toHaveBeenCalled();
  });
});

describe('a failed save', () => {
  const failed = (message: string) => ({ message, variant: NotificationVariant.ERROR });
  const kept = { path: ['notes', 'safetyNotes'], name: 'notes' };

  function storeWithTemplate() {
    const recording = makeRecordingStore();
    recording.store.dispatch(
      getAllTemplatesActions.success([
        {
          id: 'template_5',
          name: 'template',
          data: emptyReactionData(),
          previews: {},
          summary: { provenance: {}, summary: {}, conditions: '' },
          variables: { 'notes.safetyNotes': kept },
          modified_at: '',
        },
      ] as never),
    );
    return recording;
  }

  it('of a template removal says so and stays on the template', async () => {
    axiosMock.delete.mockRejectedValue(new Error('offline'));
    const { store } = makeRecordingStore();
    await store.dispatch(removeTemplate('template_5') as unknown as UnknownAction);
    expect(showNotification).toHaveBeenCalledWith(failed('Failed to remove template.'));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('of a template rename says so', async () => {
    axiosMock.patch.mockRejectedValue(new Error('offline'));
    const { store } = makeRecordingStore();
    await store.dispatch(
      renameTemplate({
        templateId: 'template_5',
        name: 'new',
      }) as unknown as UnknownAction,
    );
    expect(showNotification).toHaveBeenCalledWith(failed('Failed to rename template.'));
  });

  it('of a template variable says so and restores the variables', async () => {
    axiosMock.patch.mockRejectedValue(new Error('offline'));
    const { store } = storeWithTemplate();
    await store.dispatch(
      addUpdateVariable({
        templateId: 'template_5',
        variable: { path: ['conditions', 'temperature'], name: 'temp' },
      } as never) as unknown as UnknownAction,
    );
    expect(axiosMock.patch).toHaveBeenCalled();
    expect(showNotification).toHaveBeenCalledWith(
      failed('Failed to update template variables.'),
    );
    const template = store.getState().entities.reactions.reactionsById.template_5 as {
      variables: unknown;
    };
    expect(template.variables).toEqual({ 'notes.safetyNotes': kept });
  });
});
