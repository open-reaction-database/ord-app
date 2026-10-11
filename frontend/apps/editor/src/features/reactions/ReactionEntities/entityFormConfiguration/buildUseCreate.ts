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
import {
  useDrawer,
  useReactionActions,
} from 'features/reactions/provider/reactionProvider.hooks.ts';
import type { ReactionPathComponents } from '@open-reaction-database/ui/reaction/model';

export const buildUseCreate = <T = unknown>(
  entityName: string | ReactionPathComponents,
  createKeyWithEmpty: (
    newIndex: number,
    list: Array<T>,
    creationInfo?: Partial<T>,
  ) => [number | string, T],
  shouldOpenSidebar = true,
) =>
  function useCreate() {
    const drawer = useDrawer();
    const actions = useReactionActions();
    const { pathComponents } = useContext(reactionEntityContext);

    return useCallback(
      (newIndex: number, entitiesList: Array<T>, creationInfo?: Partial<T>) => {
        // Derived from the stable factory arg `entityName`; computed here so it isn't a render-scope
        // dependency that would defeat the useCallback memoization.
        const entityPathComponents: ReactionPathComponents =
          typeof entityName === 'string' ? [entityName] : entityName;
        const [key, newEntity] = createKeyWithEmpty(
          newIndex,
          entitiesList,
          creationInfo,
        );
        const updatedPathComponents = pathComponents
          .concat(entityPathComponents)
          .concat(key);

        void actions?.update(updatedPathComponents, newEntity);
        if (shouldOpenSidebar) {
          drawer.push(updatedPathComponents);
        }
      },
      [actions, drawer, pathComponents],
    );
  };
