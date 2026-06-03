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
import { describe, it, expect, vi, afterEach } from 'vitest';
import { copyReactionPart, pasteReactionPart } from './reactionEntityForm.utils.ts';
import { ReactionNodeEntity } from 'store/entities/reactions/reactions.types.ts';
import { ordNotesToReaction } from 'store/entities/reactions/reactionNotes/reactionNotes.converters.ts';

vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));

/** Backs navigator.clipboard with an in-memory string so write/read round-trip in tests. */
function stubClipboard() {
  let stored = '';
  const writeText = vi.fn((text: string) => {
    stored = text;
    return Promise.resolve();
  });
  const readText = vi.fn(() => Promise.resolve(stored));
  vi.stubGlobal('navigator', { clipboard: { writeText, readText } });
  return { writeText, readText, setStored: (text: string) => (stored = text) };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('copyReactionPart', () => {
  it('writes a JSON envelope tagging the entity type to the clipboard', async () => {
    const { writeText } = stubClipboard();
    await copyReactionPart(ReactionNodeEntity.Notes, ordNotesToReaction(null));
    expect(writeText).toHaveBeenCalledOnce();
    const envelope = JSON.parse(writeText.mock.calls[0][0]);
    expect(envelope.type).toBe(ReactionNodeEntity.Notes);
    expect(envelope).toHaveProperty('value');
  });

  it('swallows clipboard write failures instead of throwing', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn(() => Promise.reject(new Error('denied'))) } });
    await expect(copyReactionPart(ReactionNodeEntity.Notes, ordNotesToReaction(null))).resolves.toBeUndefined();
  });
});

describe('pasteReactionPart', () => {
  it('round-trips a copied chunk back into a reaction part', async () => {
    stubClipboard();
    await copyReactionPart(ReactionNodeEntity.Notes, ordNotesToReaction(null));
    const [result, text] = await pasteReactionPart(ReactionNodeEntity.Notes);
    expect(result).not.toBeNull();
    expect(text).not.toBe('');
    // id/name are stripped by the paste so they don't overwrite the target entity's identity.
    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('name');
  });

  it('rejects a chunk whose entity type does not match the target field', async () => {
    const clipboard = stubClipboard();
    clipboard.setStored(JSON.stringify({ type: ReactionNodeEntity.Conditions, value: {} }));
    expect(await pasteReactionPart(ReactionNodeEntity.Notes)).toEqual([null, '']);
  });

  it('returns a null result for invalid clipboard JSON', async () => {
    const clipboard = stubClipboard();
    clipboard.setStored('not valid json');
    expect(await pasteReactionPart(ReactionNodeEntity.Notes)).toEqual([null, '']);
  });
});
