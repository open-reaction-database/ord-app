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
import { reactionContext } from '../../reactions.context.ts';
import { useCallback, useContext, type ReactNode } from 'react';
import { Button } from '@mantine/core';
import { AddCircleIcon, EditIcon, ViewIcon } from 'common/icons';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { addReactionPathComponentToList } from 'store/features/reactionForm/reactionForm.actions.ts';
import classes from './openSingleEntityButton.module.scss';

interface OpenSingleEntityButtonProps {
  pathComponents: ReactionPathComponents;
}

export function OpenSingleEntityButton({ pathComponents }: Readonly<OpenSingleEntityButtonProps>) {
  const dispatch = useAppDispatch();
  const { isViewOnly, isTemplate } = useContext(reactionContext);

  const onOpen = useCallback(() => {
    dispatch(addReactionPathComponentToList(pathComponents));
  }, [dispatch, pathComponents]);

  let text: string;
  let icon: ReactNode;

  if (isTemplate) {
    text = 'Set variables';
    icon = <EditIcon />;
  } else if (isViewOnly) {
    text = 'View';
    icon = <ViewIcon />;
  } else {
    text = 'Edit';
    icon = <AddCircleIcon />;
  }

  return (
    <Button
      onClick={onOpen}
      leftSection={icon}
      classNames={{ section: classes.icon }}
    >
      {text}
    </Button>
  );
}
