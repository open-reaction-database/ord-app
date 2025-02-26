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
import { Button, Flex, Text, Title } from '@mantine/core';
import { ord } from 'ord-schema-protobufjs';
import { AddCircleIcon, EmptyIcon } from 'common/icons';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { useCallback, useContext } from 'react';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { addReactionPathComponentToList } from 'store/features/reactionForm/reactionForm.actions.ts';
import {
  ReactionEntityBlock,
  ReactionEntityBlockTitle,
} from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityBlock/ReactionEntityBlock.tsx';
import { ordCompoundToReactionCompound } from 'store/entities/reactions/reactionsInputs/reactionsInputs.converters.ts';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import { typographyClasses } from 'common/styling';
import type { AppReactionCompound } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import { buildUseSelectItems } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import { ComponentsList } from 'features/reactions/ReactionView/ComponentsList/ComponentsList.tsx';

const useSelectData = buildUseSelectItems('components');

export function InputsComponentList() {
  const dispatch = useAppDispatch();
  const { reactionId, pathComponents } = useContext(reactionEntityContext);
  const components = useSelectData() as Array<AppReactionCompound>;
  const length = components.length;

  const onCreateComponent = useCallback(() => {
    const newComponent = ordCompoundToReactionCompound(ord.Compound.toObject(new ord.Compound()));
    const newPath = [...pathComponents, 'components', length];
    dispatch(addUpdateReactionField({ reactionId, pathComponents: newPath, newValue: newComponent }));
    dispatch(addReactionPathComponentToList(newPath));
  }, [dispatch, reactionId, pathComponents, length]);

  return (
    <ReactionEntityBlock
      renderedTitle={
        <ReactionEntityBlockTitle
          leftSection={
            <>
              <Title order={3}>Components</Title>
              <span>·</span>
              {components.length}
            </>
          }
          rightSection={
            <Button
              variant="transparent"
              leftSection={<AddCircleIcon />}
              onClick={onCreateComponent}
            >
              Add component
            </Button>
          }
        />
      }
    >
      {components.length > 0 ? (
        <ComponentsList
          reactionId={reactionId}
          components={components}
          inputPathComponent={pathComponents}
        />
      ) : (
        <Flex
          direction="column"
          align="center"
          gap="8"
        >
          <EmptyIcon />
          <Text className={typographyClasses.secondary1}>There are no Components yet</Text>
        </Flex>
      )}
    </ReactionEntityBlock>
  );
}
