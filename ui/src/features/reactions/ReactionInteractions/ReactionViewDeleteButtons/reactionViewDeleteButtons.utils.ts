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
import { useCallback, type MouseEvent } from 'react';
import {
  addReactionPathComponentToList,
  setReactionPathComponentsList,
} from 'store/features/reactionForm/reactionForm.actions.ts';
import type { ReactionViewDeleteButtonsProps } from './reactionViewDeleteButtons.types.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';

export const onViewDeleteButtonsWrapperClick = (event: MouseEvent) => {
  event.stopPropagation();
};

export const useOnViewEdit = ({
  pathComponents,
  historyPathComponents,
}: Omit<ReactionViewDeleteButtonsProps, 'entityName'>) => {
  const dispatch = useAppDispatch();
  return useCallback(() => {
    if (historyPathComponents) {
      dispatch(setReactionPathComponentsList(historyPathComponents.concat([pathComponents])));
    } else {
      dispatch(addReactionPathComponentToList(pathComponents));
    }
  }, [dispatch, pathComponents, historyPathComponents]);
};
