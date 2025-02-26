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
import { useCallback, useContext } from 'react';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { addReactionPathComponentToList } from 'store/features/reactionForm/reactionForm.actions.ts';

export const buildUseCreate = <T = unknown>(
  entityName: string,
  createKeyWithEmpty: (newIndex: number, list: Array<T>, creationInfo?: Partial<T>) => [number | string, T],
  shouldOpenSidebar = true,
) =>
  function useCreate() {
    const dispatch = useAppDispatch();
    const { reactionId, pathComponents } = useContext(reactionEntityContext);

    return useCallback(
      (newIndex: number, entitiesList: Array<T>, creationInfo?: Partial<T>) => {
        const [key, newEntity] = createKeyWithEmpty(newIndex, entitiesList, creationInfo);
        const updatedPathComponents = [...pathComponents, entityName, key];

        dispatch(
          addUpdateReactionField({
            reactionId,
            pathComponents: updatedPathComponents,
            newValue: newEntity,
          }),
        );
        if (shouldOpenSidebar) {
          dispatch(addReactionPathComponentToList(updatedPathComponents));
        }
      },
      [dispatch, pathComponents, reactionId],
    );
  };
