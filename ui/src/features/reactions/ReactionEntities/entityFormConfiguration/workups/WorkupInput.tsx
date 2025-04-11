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
import { reactionContext } from 'features/reactions/reactions.context.ts';
import { useCallback, useContext, useMemo } from 'react';
import type { Optional } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import { useSelector } from 'react-redux';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors.ts';
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
import { ord } from 'ord-schema-protobufjs';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { ordInputToReactionInputWithoutName } from 'store/entities/reactions/reactionsInputs/reactionsInputs.converters.ts';
import type { ReactionInputComponent } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { ComponentDisplayRowCustomActions } from 'features/reactions/ReactionView/ComponentsList/ComponentDisplayRowCustomActions.tsx';
import { addReactionPathComponentToList } from 'store/features/reactionForm/reactionForm.actions.ts';
import { ComponentsListHeader } from 'features/reactions/ReactionView/ComponentsList';
import { ComponentsListOrEmpty } from 'common/components/display/ComponentsListOrEmpty/ComponentsListOrEmpty.tsx';

const ENTITY_NAME = 'Input';

const COMPONENTS_FIELD = 'components';

const renderDetails = ({ amount }: ReactionInputComponent) => `${amount.value ?? ''} ${amount.units}`.trim();

export function WorkupInput({ name }: Readonly<ReactionFormCustomProps>) {
  const dispatch = useAppDispatch();
  const { reactionId, ViewDeleteButtonsComponent, isViewOnly } = useContext(reactionContext);
  const { pathComponents } = useContext(reactionEntityContext);

  const currentPath = useMemo(() => {
    return pathComponents.concat(name);
  }, [pathComponents, name]);

  const onWorkupComponentEdit = useCallback(
    (index: number) => {
      dispatch(addReactionPathComponentToList(currentPath));
      dispatch(addReactionPathComponentToList(currentPath.concat([COMPONENTS_FIELD, index])));
    },
    [currentPath, dispatch],
  );

  const input: Optional<ReactionInputWithoutName> = useSelector(selectReactionPartByPath(reactionId, currentPath));

  const onRemove = useCallback(() => {
    dispatch(addUpdateReactionField({ reactionId, pathComponents: currentPath, newValue: null }));
  }, [currentPath, dispatch, reactionId]);

  const onCreate = useCallback(() => {
    const input = ordInputToReactionInputWithoutName(ord.ReactionInput.toObject(new ord.ReactionInput()));
    dispatch(addUpdateReactionField({ reactionId, pathComponents: currentPath, newValue: input }));
  }, [currentPath, dispatch, reactionId]);

  return !!input || !isViewOnly ? (
    <ReactionEntityBlock
      renderedTitle={
        <ReactionEntityBlockTitle
          leftSection={<Title order={4}>{ENTITY_NAME}</Title>}
          rightSection={
            input ? (
              <ViewDeleteButtonsComponent
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
                  <ViewDeleteButtonsComponent
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
