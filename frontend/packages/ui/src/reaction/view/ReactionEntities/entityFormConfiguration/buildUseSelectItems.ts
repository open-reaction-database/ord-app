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
import { useContext, useMemo } from 'react';
import { reactionEntityContext } from '#reaction/view/ReactionEntities/reactionEntity.context.ts';
import { useReactionPart } from '#reaction/provider/reactionProvider.hooks.ts';
import type { ReactionPathComponents } from '#reaction/model/reactionPathComponents.ts';

const NO_ITEMS: Array<never> = [];

/** Selects the list at `entityPath` under the entity in context; a missing list is empty. */
export const buildUseSelectItems = <T>(entityPath: ReactionPathComponents | string) =>
  function useSelectItems(): Array<T> {
    const { pathComponents } = useContext(reactionEntityContext);
    const entityPathComponents: ReactionPathComponents =
      typeof entityPath === 'string' ? [entityPath] : entityPath;

    return (
      useReactionPart<Array<T>>(pathComponents.concat(entityPathComponents)) ?? NO_ITEMS
    );
  };

export const buildUseSelectItemsListFromMap = <T>(
  entityName: string,
  compareFn: (a: T, b: T) => number,
) =>
  function useSelectItems() {
    const { pathComponents } = useContext(reactionEntityContext);
    const map = useReactionPart<Record<string, T>>([...pathComponents, entityName]);

    // A missing map lists nothing.
    return useMemo(() => Object.values(map ?? {}).sort(compareFn), [map]);
  };
