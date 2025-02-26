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
import { Divider, Flex } from '@mantine/core';
import { InlineKeyValue } from 'common/components/display/InlineKeyValue/InlineKeyValue.tsx';
import { ReactionComponentPreview } from 'features/reactions/ReactionPreview/ReactionComponentPreview.tsx';
import { EditButton } from 'common/components/EditButton/EditButton.tsx';
import { ReactionEntityDelete } from 'features/reactions/ReactionEntities/ReactionEntityDelete/ReactionEntityDelete.tsx';
import type { AppReactionCompound } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import { reversePrimitiveRecord } from 'common/utils/reversePrimitiveRecord.ts';
import { ord } from 'ord-schema-protobufjs';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';

interface ComponentDisplayRowProps {
  reactionId: number;
  componentPath: ReactionPathComponents;
  component: AppReactionCompound;
  gridClassName?: string;
}

const identifierNameByValue = reversePrimitiveRecord(ord.CompoundIdentifier.CompoundIdentifierType);

const reactionRoleByValue = reversePrimitiveRecord(ord.ReactionRole.ReactionRoleType);

export function ComponentDisplayRow({
  reactionId,
  component,
  componentPath,
  gridClassName = clsx(classes.grid, classes.row),
}: Readonly<ComponentDisplayRowProps>) {
  const dispatch = useAppDispatch();
  const componentId = component.id;
  const previewState = useSelector(selectPreviewsByIdsWrapper([componentId]));
  const inputPath = componentPath.slice(0, 2);

  const onEditComponent = () => {
    dispatch(setReactionPathComponentsList([inputPath, componentPath]));
  };

  return (
    <div
      key={component.id}
      className={gridClassName}
    >
      <Flex
        className={classes.identifiers}
        align="center"
      >
        {component.identifiers.map(identifier => (
          <InlineKeyValue
            key={identifier.value}
            label={identifierNameByValue[identifier.type ?? 0]}
            value={identifier.value}
          />
        ))}
      </Flex>
      <Flex
        align="center"
        className={clsx(classes.preview, classes.imagePreview)}
      >
        <ReactionComponentPreview previewState={previewState[component.id]} />
      </Flex>
      <Flex
        align="center"
        className={classes.role}
      >
        {reactionRoleByValue[component.reactionRole ?? 0]}
      </Flex>
      <Flex
        align="center"
        className={classes.amount}
      >
        {component.amount.value} {component.amount.units}
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
