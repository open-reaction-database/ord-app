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
import { create } from '@bufbuild/protobuf';
import { ProductCompoundSchema } from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { AddCircleIcon, EmptyIcon } from 'common/icons';
import { useCallback, useContext } from 'react';
import {
  reactionEntityContext,
  useDrawer,
  useIsViewOnly,
  useReactionActions,
} from '@open-reaction-database/ui/reaction';
import {
  ReactionEntityBlock,
  ReactionEntityBlockTitle,
} from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityBlock/ReactionEntityBlock.tsx';
import { typographyClasses } from '@open-reaction-database/ui/theme';
import {
  type ReactionProduct,
  ordProductToReaction,
} from '@open-reaction-database/ui/reaction/model';
import { buildUseSelectItems } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import { ComponentsList } from 'features/reactions/ReactionView/ComponentsList/ComponentsList.tsx';
import { TitleDelimiterAmount } from 'common/components/display/TitleDelimiterAmount/TitleDelimiterAmount.tsx';
import { MeasurementsPreview } from 'features/reactions/ReactionView/Outcomes/MeasurementsPreview/MeasurementsPreview.tsx';
import { ReactionNodeValidationResult } from 'features/reactions/ReactionInteractions/ReactionNodeValidationResult/ReactionNodeValidationResult.tsx';

const ENTITY_FIELD = 'products';

const useSelectData = buildUseSelectItems<ReactionProduct>(ENTITY_FIELD);

const renderDetails = (product: ReactionProduct) => (
  <MeasurementsPreview product={product} />
);

export function ProductsComponentsList() {
  const drawer = useDrawer();
  const actions = useReactionActions();
  const isViewOnly = useIsViewOnly();
  const { pathComponents } = useContext(reactionEntityContext);
  const components = useSelectData();
  const length = components.length;

  const onCreateComponent = useCallback(() => {
    const newComponent = ordProductToReaction(create(ProductCompoundSchema));
    const newPath = [...pathComponents, ENTITY_FIELD, length];
    void actions?.update(newPath, newComponent);
    drawer.push(newPath);
  }, [drawer, actions, pathComponents, length]);

  return (
    <ReactionEntityBlock
      renderedTitle={
        <ReactionEntityBlockTitle
          leftSection={
            <Flex
              align="center"
              gap="sm"
            >
              <Flex
                align="center"
                gap="xs"
              >
                <TitleDelimiterAmount
                  title="Products"
                  amount={components.length}
                />
              </Flex>
              <ReactionNodeValidationResult pathComponents={['products']} />
            </Flex>
          }
          rightSection={
            !isViewOnly && (
              <Button
                variant="transparent"
                leftSection={<AddCircleIcon />}
                onClick={onCreateComponent}
              >
                Product
              </Button>
            )
          }
        />
      }
    >
      {components.length > 0 ? (
        <ComponentsList
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
          <Text className={typographyClasses.secondary1}>
            There are no Products yet
          </Text>
        </Flex>
      )}
    </ReactionEntityBlock>
  );
}
