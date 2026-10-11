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
import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useContext } from 'react';
import {
  useIsViewOnly,
  useReactionActions,
  useReactionSnapshot,
} from '#reaction/provider/reactionProvider.hooks.ts';
import { reactionEntityContext } from '#reaction/view/ReactionEntities/reactionEntity.context.ts';
import { emptyReactionData } from './emptyReactionData.ts';
import {
  reactionWrapper,
  renderWithReaction,
  stubReactionActions,
} from './renderWithReaction.tsx';

function useProbe() {
  return {
    snapshot: useReactionSnapshot(),
    isViewOnly: useIsViewOnly(),
    actions: useReactionActions(),
    pathComponents: useContext(reactionEntityContext).pathComponents,
  };
}

describe('reactionWrapper', () => {
  it('holds an empty, read-only reaction by default', () => {
    const { result } = renderHook(useProbe, { wrapper: reactionWrapper() });
    // Each empty reaction gets new entity IDs, so compare the parts that hold none.
    expect(result.current.snapshot?.data).toMatchObject({
      reactionId: '',
      inputs: {},
      outcomes: [],
      identifiers: [],
      workups: [],
    });
    expect(result.current.isViewOnly).toBe(true);
    expect(result.current.actions).toBeUndefined();
    expect(result.current.pathComponents).toEqual([]);
  });

  it('holds the given reaction and the stored fields beside it', () => {
    const reaction = { ...emptyReactionData(), reactionId: 'r1' };
    const { result } = renderHook(useProbe, {
      wrapper: reactionWrapper({ reaction, record: { pb_reaction_id: 'ord-1' } }),
    });
    expect(result.current.snapshot?.data).toBe(reaction);
    expect(result.current.snapshot?.pb_reaction_id).toBe('ord-1');
  });

  it('is editable with stub actions when asked to be', () => {
    const { result } = renderHook(useProbe, {
      wrapper: reactionWrapper({ editable: true }),
    });
    expect(result.current.isViewOnly).toBe(false);
    expect(result.current.actions?.update).toBeTypeOf('function');
  });

  it('uses the actions it is given', () => {
    const actions = stubReactionActions();
    const { result } = renderHook(useProbe, { wrapper: reactionWrapper({ actions }) });
    expect(result.current.actions).toBe(actions);
  });

  it('opens the entity at pathComponents', () => {
    const { result } = renderHook(useProbe, {
      wrapper: reactionWrapper({ pathComponents: ['inputs', 'in1'] }),
    });
    expect(result.current.pathComponents).toEqual(['inputs', 'in1']);
  });
});

describe('renderWithReaction', () => {
  it('renders under the wrapper the options describe', () => {
    function Probe() {
      const { snapshot, isViewOnly } = useProbe();
      return <output>{`${snapshot?.pb_reaction_id} ${isViewOnly}`}</output>;
    }
    const { getByRole } = renderWithReaction(<Probe />, {
      record: { pb_reaction_id: 'ord-2' },
      editable: true,
    });
    expect(getByRole('status')).toHaveTextContent('ord-2 false');
  });
});

describe('stubReactionActions', () => {
  it('settles each action without effect', async () => {
    const actions = stubReactionActions();
    await expect(actions.update(['notes'], 'x')).resolves.toBeUndefined();
    await expect(actions.remove(['notes'])).resolves.toBeUndefined();
    await expect(actions.addIdentifierByName(['identifiers'], 'water')).resolves.toBe(
      false,
    );
    expect(actions.currentPerson()).toBeUndefined();
  });
});
