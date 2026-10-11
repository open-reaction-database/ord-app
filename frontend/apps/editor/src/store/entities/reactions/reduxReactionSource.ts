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
import { create } from '@bufbuild/protobuf';
import {
  CompoundIdentifier_CompoundIdentifierType,
  CompoundIdentifierSchema,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import type { Action, Store, ThunkDispatch } from '@reduxjs/toolkit';
import type {
  ReactionActions,
  ReactionSource,
} from 'features/reactions/provider/reactionProvider.types.ts';
import axiosInstance from 'store/axiosInstance.ts';
import type { AppState } from 'store/configureAppStore.ts';
import { selectSelf } from 'store/entities/users/users.selectors.ts';
import type { User } from 'store/entities/users/users.types.ts';
import { ordCompoundIdentifierToReaction } from './reactionEntity/reactionEntity.converters.ts';
import type { ReactionCompoundIdentifier } from './reactionEntity/reactionEntity.types.ts';
import type { ReactionPerson } from './reactionProvenance/reactionProvenance.types.ts';
import { selectReactionById, selectReactionPartByPath } from './reactions.selectors.ts';
import { addUpdateReactionField, deleteReactionField } from './reactions.thunks.ts';
import type { ReactionId } from './reactions.types.ts';
import { selectReactionsPreviews } from './reactionsPreviews/reactionsPreviews.selectors.ts';

/** Reads one reaction, dataset or template, and the rendered previews from the editor's store. */
export function reduxReactionSource(
  store: Pick<Store<AppState>, 'getState' | 'subscribe'>,
  reactionId: ReactionId,
): ReactionSource {
  return {
    getSnapshot: () => selectReactionById(reactionId)(store.getState()),
    getPreviews: () => selectReactionsPreviews(store.getState()),
    subscribe: listener => store.subscribe(listener),
  };
}

/** What the actions need from the editor's store. */
export interface ReduxReactionStore {
  dispatch: ThunkDispatch<AppState, never, Action>;
  getState: () => AppState;
}

const PERSON_FIELDS: Array<[keyof ReactionPerson, keyof User]> = [
  ['name', 'name'],
  ['email', 'email'],
  ['orcid', 'orcid_id'],
];

function personFromUser(user: User): ReactionPerson {
  return PERSON_FIELDS.reduce((person: ReactionPerson, [personKey, userKey]) => {
    const value = user[userKey];
    return value ? { ...person, [personKey]: value } : person;
  }, {});
}

function smilesIdentifier(name: string, smiles: string): ReactionCompoundIdentifier {
  return ordCompoundIdentifierToReaction(
    create(CompoundIdentifierSchema, {
      type: CompoundIdentifier_CompoundIdentifierType.SMILES,
      value: smiles,
      details: name,
    }),
  );
}

/**
 * Edits one reaction through the thunks that apply a change optimistically and save it.
 *
 * The thunks are async, so dispatching one returns a promise, though `ThunkWrapper` types
 * the result as void; awaiting it makes each action settle when the save does. The thunk
 * wrapper catches a failed save and dispatches the failure action, so the action resolves
 * then too.
 */
export function reduxReactionActions(
  { dispatch, getState }: ReduxReactionStore,
  reactionId: ReactionId,
): ReactionActions {
  return {
    update: async (pathComponents, newValue) => {
      await dispatch(addUpdateReactionField({ reactionId, pathComponents, newValue }));
    },
    remove: async pathComponents => {
      await dispatch(deleteReactionField({ reactionId, pathComponents }));
    },
    addIdentifierByName: async (identifiersPath, name) => {
      let smiles: string;
      try {
        const response = await axiosInstance.post<{ smiles: string }>(
          '/resolve-compound',
          {
            identifier_type: 'name',
            identifier: name,
          },
        );
        smiles = response.data.smiles;
      } catch (_e) {
        // The name did not resolve, or the request failed; either way nothing is added.
        return false;
      }
      // Read the list after the request returns, so the new identifier goes last.
      const identifiers = (selectReactionPartByPath(
        reactionId,
        identifiersPath,
      )(getState()) ?? []) as Array<ReactionCompoundIdentifier>;
      // The edit applies at once; its save settles later and reports its own failure.
      void dispatch(
        addUpdateReactionField({
          reactionId,
          pathComponents: [...identifiersPath, identifiers.length],
          newValue: smilesIdentifier(name, smiles),
        }),
      );
      return true;
    },
    currentPerson: () => {
      const user = selectSelf(getState());
      return user ? personFromUser(user) : undefined;
    },
  };
}
