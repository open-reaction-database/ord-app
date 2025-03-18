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
import { useContext } from 'react';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions.ts';
import classes from './componentsList.module.scss';
import { Divider } from '@mantine/core';
import { EditButton } from 'common/components/EditButton/EditButton.tsx';
import { ReactionEntityDelete } from 'features/reactions/ReactionEntities/ReactionEntityDelete/ReactionEntityDelete.tsx';
import type { ReactionComponentBase } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { ComponentDisplayRowCustomActions } from './ComponentDisplayRowCustomActions.tsx';
import type { ComponentDisplayRowProps } from './componentsList.types.ts';
import { templatesContext } from 'features/templates/templates.context';

export function ComponentDisplayRow<T extends ReactionComponentBase>({
  reactionId,
  component,
  componentPath,
  renderDetails,
  gridClassName,
}: Readonly<ComponentDisplayRowProps<T>>) {
  const dispatch = useAppDispatch();
  const previousEntityPath = componentPath.slice(0, 2);
  const { isTemplate } = useContext(templatesContext);
  const onEditComponent = () => {
    dispatch(setReactionPathComponentsList([previousEntityPath, componentPath]));
  };

  return (
    <ComponentDisplayRowCustomActions
      component={component}
      renderDetails={renderDetails}
      gridClassName={gridClassName}
      actions={
        !isTemplate && (
          <>
            <EditButton onClick={onEditComponent} />
            <Divider
              className={classes.actionDivider}
              orientation="vertical"
            />
            <ReactionEntityDelete
              reactionId={reactionId}
              entityName="Component"
              pathComponents={componentPath}
            />
          </>
        )
      }
    />
  );
}
