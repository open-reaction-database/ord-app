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
import { Button, Flex, Text } from '@mantine/core';
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
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import { typographyClasses } from 'common/styling';
import type { ReactionProduct } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { buildUseSelectItems } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import { ComponentsList } from 'features/reactions/ReactionView/ComponentsList/ComponentsList.tsx';
import { ordProductToReaction } from 'store/entities/reactions/reactionComponent/reactionComponent.converters.ts';
import { TitleDelimiterAmount } from 'common/components/display/TitleDelimiterAmount/TitleDelimiterAmount.tsx';

const ENTITY_FIELD = 'products';

const useSelectData = buildUseSelectItems(ENTITY_FIELD);

const renderDetails = (_: ReactionProduct) => '';

export function ProductsComponentsList() {
  const dispatch = useAppDispatch();
  const { reactionId, pathComponents } = useContext(reactionEntityContext);
  const components = useSelectData() as Array<ReactionProduct>;
  const length = components.length;

  const onCreateComponent = useCallback(() => {
    const newComponent = ordProductToReaction(ord.ProductCompound.toObject(new ord.ProductCompound()));
    const newPath = [...pathComponents, ENTITY_FIELD, length];
    dispatch(addUpdateReactionField({ reactionId, pathComponents: newPath, newValue: newComponent }));
    dispatch(addReactionPathComponentToList(newPath));
  }, [dispatch, reactionId, pathComponents, length]);

  return (
    <ReactionEntityBlock
      renderedTitle={
        <ReactionEntityBlockTitle
          leftSection={
            <TitleDelimiterAmount
              title="Products"
              amount={components.length}
            />
          }
          rightSection={
            <Button
              variant="transparent"
              leftSection={<AddCircleIcon />}
              onClick={onCreateComponent}
            >
              Product
            </Button>
          }
        />
      }
    >
      {components.length > 0 ? (
        <ComponentsList
          reactionId={reactionId}
          components={components}
          rootPathComponents={pathComponents}
          detailsHeader="Measurements"
          entityName="products"
          renderDetails={renderDetails}
        />
      ) : (
        <Flex
          direction="column"
          align="center"
          gap="8"
        >
          <EmptyIcon />
          <Text className={typographyClasses.secondary1}>There are no Products yet</Text>
        </Flex>
      )}
    </ReactionEntityBlock>
  );
}
