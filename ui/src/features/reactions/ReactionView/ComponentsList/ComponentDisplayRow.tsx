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
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { useSelector } from 'react-redux';
import { selectPreviewsByIdsWrapper } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.selectors.ts';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions.ts';
import clsx from 'clsx';
import classes from 'features/reactions/ReactionView/ComponentsList/componentsList.module.scss';
import { Divider, Flex, Text, Tooltip } from '@mantine/core';
import { ReactionComponentPreview } from 'features/reactions/ReactionPreview/ReactionComponentPreview.tsx';
import { EditButton } from 'common/components/EditButton/EditButton.tsx';
import { ReactionEntityDelete } from 'features/reactions/ReactionEntities/ReactionEntityDelete/ReactionEntityDelete.tsx';
import type { ReactionComponentBase } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type { ReactNode } from 'react';
import { typographyClasses } from 'common/styling';

interface ComponentDisplayRowProps<T extends ReactionComponentBase> {
  reactionId: number;
  componentPath: ReactionPathComponents;
  component: T;
  renderDetails: (component: T) => ReactNode;
  gridClassName?: string;
}

export function ComponentDisplayRow<T extends ReactionComponentBase>({
  reactionId,
  component,
  componentPath,
  renderDetails,
  gridClassName = clsx(classes.grid, classes.row),
}: Readonly<ComponentDisplayRowProps<T>>) {
  const dispatch = useAppDispatch();
  const componentId = component.id;
  const previewState = useSelector(selectPreviewsByIdsWrapper([componentId]));
  const previousEntityPath = componentPath.slice(0, 2);

  const onEditComponent = () => {
    dispatch(setReactionPathComponentsList([previousEntityPath, componentPath]));
  };

  return (
    <div
      key={component.id}
      className={gridClassName}
    >
      <Flex
        className={classes.identifiers}
        align="flex-start"
        direction="column"
      >
        {component.identifiers.map(identifier => (
          <Flex
            className={classes.identifierWrapper}
            gap="xs"
            key={identifier.value}
          >
            <Text className={typographyClasses.secondary2}>{identifier.type}:</Text>
            <Tooltip label={identifier.value}>
              <Text className={classes.identifierValue}>{identifier.value}</Text>
            </Tooltip>
          </Flex>
        ))}
      </Flex>
      <Flex
        align="center"
        justify="center"
        className={clsx(classes.preview, classes.imagePreview)}
      >
        <ReactionComponentPreview previewState={previewState[component.id]} />
      </Flex>
      <Flex
        align="center"
        className={classes.role}
      >
        {component.reactionRole}
      </Flex>
      <Flex
        align="center"
        className={classes.details}
      >
        {renderDetails(component)}
      </Flex>
      <Flex
        className={classes.actions}
        align="center"
        justify="flex-end"
      >
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
      </Flex>
    </div>
  );
}
