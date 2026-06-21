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
import { removeTemplate, importFromFile } from './templates.thunks.ts';
import {
  removeTemplateActions,
  importTemplateFromFileActions,
} from './templates.actions.ts';

vi.mock('store/axiosInstance.ts', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('wouter/use-browser-location', () => ({ navigate: vi.fn() }));
vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));

const axiosMock = axiosInstance as unknown as Record<
  'get' | 'post' | 'patch' | 'delete',
  ReturnType<typeof vi.fn>
>;

beforeEach(() => {
  vi.clearAllMocks();
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
