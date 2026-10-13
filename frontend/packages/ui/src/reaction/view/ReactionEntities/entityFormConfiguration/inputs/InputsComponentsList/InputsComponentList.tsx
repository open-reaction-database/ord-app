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
import { Button, Flex } from '@mantine/core';
import { create } from '@bufbuild/protobuf';
import { CompoundSchema } from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { AddCircleIcon } from '#theme/icons/index.ts';
import { useCallback, useContext } from 'react';
import { reactionEntityContext } from '#reaction/view/ReactionEntities/reactionEntity.context.ts';
import {
  useDrawer,
  useIsViewOnly,
  useReactionActions,
} from '#reaction/provider/reactionProvider.hooks.ts';
import {
  ReactionEntityBlock,
  ReactionEntityBlockTitle,
} from '#reaction/view/ReactionEntities/reactionEntityNode/ReactionEntityBlock/ReactionEntityBlock.tsx';
import { type ReactionInputComponent } from '#reaction/model/reactionComponent/reactionComponent.types.ts';
import { ordInputComponentToReaction } from '#reaction/model/reactionComponent/reactionComponent.converters.ts';
import { buildUseSelectItems } from '#reaction/view/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import { ComponentsList } from '#reaction/view/ReactionView/ComponentsList/ComponentsList.tsx';
import { TitleDelimiterAmount } from '#display/TitleDelimiterAmount/TitleDelimiterAmount.tsx';
import { ComponentsListOrEmpty } from '#display/ComponentsListOrEmpty/ComponentsListOrEmpty.tsx';
import { renderValuePrecisionUnit } from '#reaction/view/ReactionView/renderValuePrecisionUnit.ts';
import { ReactionNodeValidationResult } from '#reaction/view/ReactionInteractions/ReactionNodeValidationResult/ReactionNodeValidationResult.tsx';

const useSelectData = buildUseSelectItems<ReactionInputComponent>('components');

const renderDetails = ({ amount }: ReactionInputComponent) =>
  amount ? renderValuePrecisionUnit(amount) : '';

export function InputsComponentList() {
  const drawer = useDrawer();
  const actions = useReactionActions();
  const isViewOnly = useIsViewOnly();
  const { pathComponents } = useContext(reactionEntityContext);
  const components = useSelectData();
  const length = components.length;

  const onCreateComponent = useCallback(() => {
    const newComponent = ordInputComponentToReaction(create(CompoundSchema));
    const newPath = [...pathComponents, 'components', length];
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
                  title="Components"
                  amount={components.length}
                />
              </Flex>
              <ReactionNodeValidationResult pathComponents={['components']} />
            </Flex>
          }
          rightSection={
            !isViewOnly && (
              <Button
                variant="transparent"
                leftSection={<AddCircleIcon />}
                onClick={onCreateComponent}
              >
                Add component
              </Button>
            )
          }
        />
      }
    >
      <ComponentsListOrEmpty componentsAmount={components.length}>
        <ComponentsList
          components={components}
          rootPathComponents={pathComponents}
          onlyOpenOneSidebar={true}
          detailsHeader="Amount"
          entityName="components"
          renderDetails={renderDetails}
        />
      </ComponentsListOrEmpty>
    </ReactionEntityBlock>
  );
}
