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
import type { ReactionViewDeleteButtonsProps } from './reactionViewDeleteButtons.types.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { EditButton } from 'common/components/EditButton/EditButton.tsx';
import { Divider, Flex } from '@mantine/core';
import classes from './reactionViewDeleteButtons.module.scss';
import { ReactionEntityDelete } from '../../ReactionEntities/ReactionEntityDelete/ReactionEntityDelete.tsx';
import { onViewDeleteButtonsWrapperClick } from './reactionViewDeleteButtons.utils.ts';
import { useCallback, useContext } from 'react';
import {
  addReactionPathComponentToList,
  setReactionPathComponentsList,
} from 'store/features/reactionForm/reactionForm.actions.ts';
import { reactionContext } from '../../reactions.context.ts';

export function ReactionEditDeleteButtons({
  entityName,
  pathComponents,
  historyPathComponents,
}: Readonly<ReactionViewDeleteButtonsProps>) {
  const { reactionId } = useContext(reactionContext);
  const dispatch = useAppDispatch();

  const onEdit = useCallback(() => {
    if (historyPathComponents) {
      dispatch(setReactionPathComponentsList(historyPathComponents.concat([pathComponents])));
    } else {
      dispatch(addReactionPathComponentToList(pathComponents));
    }
  }, [dispatch, pathComponents, historyPathComponents]);

  return (
    <Flex
      onClick={onViewDeleteButtonsWrapperClick}
      align="center"
      className={classes.buttonsWrapper}
    >
      <EditButton onClick={onEdit} />
      <Divider
        className={classes.actionDivider}
        orientation="vertical"
      />
      <ReactionEntityDelete
        reactionId={reactionId}
        entityName={entityName}
        pathComponents={pathComponents}
      />
    </Flex>
  );
}
