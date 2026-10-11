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
import { useCallback, useContext, useMemo } from 'react';
import { reactionEntityContext } from '../../reactionEntity.context.ts';
import type { ReactionInputWithoutName } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import {
  ReactionEntityBlock,
  ReactionEntityBlockTitle,
} from '../../reactionEntityNode/ReactionEntityBlock/ReactionEntityBlock.tsx';
import { Button, Flex, Title } from '@mantine/core';
import classes from '../measurements/AuthenticStandard/authenticStandard.module.scss';
import { AddCircleIcon } from 'common/icons';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import { create } from '@bufbuild/protobuf';
import { ReactionInputSchema } from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { ordInputWithoutNameToReaction } from 'store/entities/reactions/reactionsInputs/reactionsInputs.converters.ts';
import type { ReactionInputComponent } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { ComponentDisplayRowCustomActions } from 'features/reactions/ReactionView/ComponentsList/ComponentDisplayRowCustomActions.tsx';
import {
  useDrawer,
  useIsViewOnly,
  useReactionId,
  useReactionPart,
  useReactionSlots,
} from 'features/reactions/provider/reactionProvider.hooks.ts';
import { ComponentsListHeader } from 'features/reactions/ReactionView/ComponentsList';
import { ComponentsListOrEmpty } from 'common/components/display/ComponentsListOrEmpty/ComponentsListOrEmpty.tsx';
import { renderValuePrecisionUnit } from 'features/reactions/ReactionView/renderValuePrecisionUnit';

const ENTITY_NAME = 'Input';

const COMPONENTS_FIELD = 'components';

const renderDetails = ({ amount }: ReactionInputComponent) =>
  amount ? renderValuePrecisionUnit(amount) : '';

export function WorkupInput({ name }: Readonly<ReactionFormCustomProps>) {
  const dispatch = useAppDispatch();
  const drawer = useDrawer();
  const reactionId = useReactionId();
  const isViewOnly = useIsViewOnly();
  const { ViewDeleteButtons } = useReactionSlots();
  const { pathComponents } = useContext(reactionEntityContext);

  const currentPath = useMemo(() => {
    return pathComponents.concat(name);
  }, [pathComponents, name]);

  const onWorkupComponentEdit = useCallback(
    (index: number) => {
      drawer.push(currentPath);
      drawer.push(currentPath.concat([COMPONENTS_FIELD, index]));
    },
    [currentPath, drawer],
  );

  const input = useReactionPart<ReactionInputWithoutName>(currentPath);

  const onRemove = useCallback(() => {
    dispatch(
      addUpdateReactionField({
        reactionId,
        pathComponents: currentPath,
        newValue: null,
      }),
    );
  }, [currentPath, dispatch, reactionId]);

  const onCreate = useCallback(() => {
    const input = ordInputWithoutNameToReaction(create(ReactionInputSchema));
    dispatch(
      addUpdateReactionField({
        reactionId,
        pathComponents: currentPath,
        newValue: input,
      }),
    );
  }, [currentPath, dispatch, reactionId]);

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
