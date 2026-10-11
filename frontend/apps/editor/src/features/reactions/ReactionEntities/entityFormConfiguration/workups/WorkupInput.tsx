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
import type { ReactionFormCustomProps } from '../../reactionEntities.types.ts';
import { useCallback } from 'react';
import { useEntityFieldPath } from '../../useEntityFieldPath.ts';
import {
  type ReactionInputWithoutName,
  ordInputWithoutNameToReaction,
  type ReactionInputComponent,
} from '@open-reaction-database/ui/reaction/model';
import {
  ReactionEntityBlock,
  ReactionEntityBlockTitle,
} from '../../reactionEntityNode/ReactionEntityBlock/ReactionEntityBlock.tsx';
import { Button, Flex, Title } from '@mantine/core';
import classes from '../measurements/AuthenticStandard/authenticStandard.module.scss';
import { AddCircleIcon } from 'common/icons';
import { create } from '@bufbuild/protobuf';
import { ReactionInputSchema } from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { ComponentDisplayRowCustomActions } from 'features/reactions/ReactionView/ComponentsList/ComponentDisplayRowCustomActions.tsx';
import {
  useDrawer,
  useIsViewOnly,
  useReactionActions,
  useReactionPart,
  useReactionSlots,
} from '@open-reaction-database/ui/reaction';
import { ComponentsListHeader } from 'features/reactions/ReactionView/ComponentsList';
import { ComponentsListOrEmpty } from 'common/components/display/ComponentsListOrEmpty/ComponentsListOrEmpty.tsx';
import { renderValuePrecisionUnit } from 'features/reactions/ReactionView/renderValuePrecisionUnit';

const ENTITY_NAME = 'Input';

const COMPONENTS_FIELD = 'components';

const renderDetails = ({ amount }: ReactionInputComponent) =>
  amount ? renderValuePrecisionUnit(amount) : '';

export function WorkupInput({ name }: Readonly<ReactionFormCustomProps>) {
  const drawer = useDrawer();
  const actions = useReactionActions();
  const isViewOnly = useIsViewOnly();
  const { ViewDeleteButtons } = useReactionSlots();
  const currentPath = useEntityFieldPath(name);

  const onWorkupComponentEdit = useCallback(
    (index: number) => {
      drawer.push(currentPath);
      drawer.push(currentPath.concat([COMPONENTS_FIELD, index]));
    },
    [currentPath, drawer],
  );

  const input = useReactionPart<ReactionInputWithoutName>(currentPath);

  const onRemove = useCallback(() => {
    void actions?.update(currentPath, null);
  }, [currentPath, actions]);

  const onCreate = useCallback(() => {
    const input = ordInputWithoutNameToReaction(create(ReactionInputSchema));
    void actions?.update(currentPath, input);
  }, [currentPath, actions]);

  return !!input || !isViewOnly ? (
    <ReactionEntityBlock
      renderedTitle={
        <ReactionEntityBlockTitle
          leftSection={<Title order={4}>{ENTITY_NAME}</Title>}
          rightSection={
            input ? (
              <ViewDeleteButtons
                entityName={ENTITY_NAME}
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
                {ENTITY_NAME}
              </Button>
            )
          }
        />
      }
    >
      {input && (
        <ComponentsListOrEmpty componentsAmount={input.components.length}>
          <ComponentsListHeader detailsHeader="Amount" />
          <Flex
            direction="column"
            gap="sm"
          >
            {input.components.map((item, index) => (
              <ComponentDisplayRowCustomActions
                key={item.id}
                component={item}
                renderDetails={renderDetails}
                actions={
                  <ViewDeleteButtons
                    entityName="Component"
                    pathComponents={currentPath.concat([COMPONENTS_FIELD, index])}
                    onEdit={() => onWorkupComponentEdit(index)}
                  />
                }
              />
            ))}
          </Flex>
        </ComponentsListOrEmpty>
      )}
    </ReactionEntityBlock>
  ) : null;
}
