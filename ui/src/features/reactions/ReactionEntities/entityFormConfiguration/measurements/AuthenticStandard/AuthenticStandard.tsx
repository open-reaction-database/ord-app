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
import { useCallback, useContext, useMemo } from 'react';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { useSelector } from 'react-redux';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors.ts';
import type { Optional } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import type { ReactionInputComponent } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import type { ReactionFormCustomProps } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { ActionIcon, Button, Flex, Title } from '@mantine/core';
import { ord } from 'ord-schema-protobufjs';
import { ordInputComponentToReaction } from 'store/entities/reactions/reactionComponent/reactionComponent.converters.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import { AddCircleIcon, RemoveIcon } from 'common/icons';
import classes from './authenticStandard.module.scss';
import { ComponentDisplayRowCustomActions } from 'features/reactions/ReactionView/ComponentsList/ComponentDisplayRowCustomActions.tsx';
import { addReactionPathComponentToList } from 'store/features/reactionForm/reactionForm.actions.ts';
import { ConfirmPopover } from 'common/components/ConfirmPopover/ConfirmPopover.tsx';
import { useDisclosure } from '@mantine/hooks';
import {
  ReactionEntityBlock,
  ReactionEntityBlockTitle,
} from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityBlock/ReactionEntityBlock.tsx';
import { EditButton } from 'common/components/EditButton/EditButton.tsx';

const renderDetails = ({ amount }: ReactionInputComponent) => `${amount.value ?? ''} ${amount.units}`.trim();

export function AuthenticStandard({ name }: Readonly<ReactionFormCustomProps>) {
  const dispatch = useAppDispatch();
  const { reactionId, pathComponents } = useContext(reactionEntityContext);
  const currentPath = useMemo(() => {
    return pathComponents.concat(name);
  }, [pathComponents, name]);
  const authenticStandard: Optional<ReactionInputComponent> = useSelector(
    selectReactionPartByPath(reactionId, currentPath),
  );

  const [opened, { open, close }] = useDisclosure();

  const onEdit = useCallback(() => {
    dispatch(addReactionPathComponentToList(currentPath));
  }, [currentPath, dispatch]);

  const onDelete = useCallback(() => {
    dispatch(addUpdateReactionField({ reactionId, pathComponents: currentPath, newValue: null }));
    close();
  }, [close, currentPath, dispatch, reactionId]);

  const onCreate = useCallback(() => {
    const authenticStandard = ordInputComponentToReaction(ord.Compound.toObject(new ord.Compound()));
    dispatch(addUpdateReactionField({ reactionId, pathComponents: currentPath, newValue: authenticStandard }));
  }, [currentPath, dispatch, reactionId]);

  return (
    <ReactionEntityBlock
      renderedTitle={
        <ReactionEntityBlockTitle
          leftSection={<Title order={4}>Authentic Standard</Title>}
          rightSection={
            authenticStandard ? (
              <>
                <EditButton onClick={onEdit} />
                <ConfirmPopover
                  opened={opened}
                  target={
                    <ActionIcon
                      variant="transparent"
                      className={classes.icon}
                      color="red"
                      onClick={open}
                    >
                      <RemoveIcon />
                    </ActionIcon>
                  }
                  title="Remove authentic standard?"
                  text="Are you sure to remove this Authentic standard?"
                  onConfirm={onDelete}
                  onCancel={close}
                />
              </>
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
      <Flex>
        {authenticStandard && (
          <ComponentDisplayRowCustomActions
            component={authenticStandard}
            renderDetails={renderDetails}
            actions={null}
          />
        )}
      </Flex>
    </ReactionEntityBlock>
  );
}
