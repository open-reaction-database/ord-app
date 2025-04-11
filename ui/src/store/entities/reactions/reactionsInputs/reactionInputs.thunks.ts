/*
 * Copyright 2024 Open Reaction Database Project Authors
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
import { createThunkWithExplicitResult } from 'store/utils';
import { addIdentifierByNameActions } from 'store/entities/reactions/reactionsInputs/reactionInputs.actions.ts';
import axiosInstance from 'store/axiosInstance.ts';
import { ord } from 'ord-schema-protobufjs';
import CompoundIdentifierType = ord.CompoundIdentifier.CompoundIdentifierType;
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors.ts';
import type { ThunkDispatch } from '@reduxjs/toolkit';
import { ordCompoundIdentifierToReaction } from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';

export const addIdentifierByName = createThunkWithExplicitResult(
  addIdentifierByNameActions,
  async (dispatch, getState, { reactionId, pathComponents, name }) => {
    try {
      const result = await axiosInstance.post<{ smiles: string }>('/resolve-compound', {
        identifier_type: 'name',
        identifier: name,
      });
      const identifierValue = result.data.smiles;
      const newIdentifier = ordCompoundIdentifierToReaction(
        ord.CompoundIdentifier.toObject(
          new ord.CompoundIdentifier({ type: CompoundIdentifierType.SMILES, value: identifierValue, details: name }),
        ),
      );
      dispatch(addIdentifierByNameActions.success());
      const identifiers: Array<ord.CompoundIdentifier> =
        selectReactionPartByPath(reactionId, pathComponents)(getState()) || [];
      const newIndex = identifiers.length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dispatch as ThunkDispatch<any, any, any>)(
        addUpdateReactionField({ reactionId, pathComponents: [...pathComponents, newIndex], newValue: newIdentifier }),
      );
    } catch (_e) {
      dispatch(addIdentifierByNameActions.failure());
    }
  },
);
