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
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { useSelector } from 'react-redux';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors.ts';

export const buildUseSelectItems = (entityName: string) =>
  function useSelectItems() {
    const { reactionId, pathComponents } = useContext(reactionEntityContext);
    return useSelector(selectReactionPartByPath(reactionId, [...pathComponents, entityName]));
  };

export const buildUseSelectItemsListFromMap = <T>(entityName: string, compareFn: (a: T, b: T) => number) =>
  function useSelectItems() {
    const { reactionId, pathComponents } = useContext(reactionEntityContext);
    const map = useSelector(selectReactionPartByPath(reactionId, [...pathComponents, entityName]));

    return useMemo(() => {
      return (Object.values(map) as Array<T>).sort(compareFn);
    }, [map]);
  };
