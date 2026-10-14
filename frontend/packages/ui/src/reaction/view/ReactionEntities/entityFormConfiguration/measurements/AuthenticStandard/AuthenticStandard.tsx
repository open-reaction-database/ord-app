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
import { useCallback } from 'react';
import { useEntityFieldPath } from '#reaction/view/ReactionEntities/useEntityFieldPath.ts';
import { type ReactionInputComponent } from '#reaction/model/reactionComponent/reactionComponent.types.ts';
import { ordInputComponentToReaction } from '#reaction/model/reactionComponent/reactionComponent.converters.ts';
import type { ReactionFormCustomProps } from '#reaction/view/ReactionEntities/reactionEntities.types.ts';
import { Button, Flex, Title } from '@mantine/core';
import { create } from '@bufbuild/protobuf';
import { CompoundSchema } from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { AddCircleIcon } from '#theme/icons/index.ts';
import { renderValuePrecisionUnit } from '#reaction/view/ReactionView/renderValuePrecisionUnit.ts';
import classes from './authenticStandard.module.scss';
import { ComponentDisplayRowCustomActions } from '#reaction/view/ReactionView/ComponentsList/ComponentDisplayRowCustomActions.tsx';
import componentsListClasses from '#reaction/view/ReactionView/ComponentsList/componentsList.module.scss';
import {
  ReactionEntityBlock,
  ReactionEntityBlockTitle,
} from '#reaction/view/ReactionEntities/reactionEntityNode/ReactionEntityBlock/ReactionEntityBlock.tsx';
import {
  useIsViewOnly,
  useReactionActions,
  useReactionPart,
  useReactionSlots,
} from '#reaction/provider/reactionProvider.hooks.ts';

const renderDetails = ({ amount }: ReactionInputComponent) =>
  amount ? renderValuePrecisionUnit(amount) : '';

export function AuthenticStandard({ name }: Readonly<ReactionFormCustomProps>) {
  const actions = useReactionActions();
  const isViewOnly = useIsViewOnly();
  const { ViewDeleteButtons } = useReactionSlots();
  const currentPath = useEntityFieldPath(name);
  const authenticStandard = useReactionPart<ReactionInputComponent>(currentPath);

  const onRemove = useCallback(() => {
    void actions?.update(currentPath, null);
  }, [currentPath, actions]);

  const onCreate = useCallback(() => {
    const authenticStandard = ordInputComponentToReaction(create(CompoundSchema));
    void actions?.update(currentPath, authenticStandard);
  }, [currentPath, actions]);

  return !!authenticStandard || !isViewOnly ? (
    <ReactionEntityBlock
      renderedTitle={
        <ReactionEntityBlockTitle
          leftSection={<Title order={4}>Authentic Standard</Title>}
          rightSection={
            authenticStandard ? (
              <ViewDeleteButtons
                entityName="Authentic standard"
                pathComponents={currentPath}
                onRemove={onRemove}
              />
            ) : (
              <Button
                classNames={{ root: classes.createButton, section: classes.icon }}
                variant="transparent"
                leftSection={<AddCircleIcon />}
                onClick={onCreate}
              >
                Authentic standard
              </Button>
            )
          }
        />
      }
    >
      <Flex className={componentsListClasses.table}>
        {authenticStandard && (
          <ComponentDisplayRowCustomActions
            component={authenticStandard}
            renderDetails={renderDetails}
            actions={null}
          />
        )}
      </Flex>
    </ReactionEntityBlock>
  ) : null;
}
