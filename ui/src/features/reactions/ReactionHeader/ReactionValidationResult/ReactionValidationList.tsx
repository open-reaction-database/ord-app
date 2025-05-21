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
import { Anchor, Drawer, Flex, Text } from '@mantine/core';
import type { ErrorWarningMessage, ReactionValidation } from 'store/entities/reactions/reactions.types.ts';
import { CrossCircleIcon, WarningIcon } from 'common/icons';
import classes from './reactionValidationResult.module.scss';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions.ts';
import { reactionFlatPathToSidebars } from 'store/entities/reactions/reactions.utils.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';

interface ReactionValidationListProps {
  opened: boolean;
  onClose: () => void;
  validation: ReactionValidation;
}

interface ErrorWarningMessageDisplayProps {
  message: ErrorWarningMessage;
  onClose: () => void;
  type: 'warning' | 'error';
}

function ErrorWarningMessageDisplay({ message, type, onClose }: Readonly<ErrorWarningMessageDisplayProps>) {
  const dispatch = useAppDispatch();
  const onClick = () => {
    if ('path' in message) {
      onClose();
      dispatch(setReactionPathComponentsList(reactionFlatPathToSidebars(message.path)));
    }
  };
  return (
    <Flex
      align="flex-start"
      wrap="wrap"
      gap="xs"
    >
      {type === 'warning' ? <WarningIcon className={classes.icon} /> : <CrossCircleIcon className={classes.icon} />}
      <Text className={classes.path}>
        {'path' in message && <Anchor onClick={onClick}>{message.originalPath}:</Anchor>}
      </Text>
      <Text>{message.text}</Text>
    </Flex>
  );
}

export function ReactionValidationList({ opened, onClose, validation }: Readonly<ReactionValidationListProps>) {
  return (
    <Drawer
      opened={opened}
      position="right"
      onClose={onClose}
      classNames={{ content: classes.sidebar, title: classes.title }}
      title="Validation Results"
    >
      <Flex
        direction="column"
        gap="xs"
      >
        {validation.errors.map((error, index) => (
          <ErrorWarningMessageDisplay
            message={error}
            type="error"
            key={`${error.text}_${index}`}
            onClose={onClose}
          />
        ))}
        {validation.warnings.map((warning, index) => (
          <ErrorWarningMessageDisplay
            message={warning}
            type="warning"
            key={`${warning.text}_${index}`}
            onClose={onClose}
          />
        ))}
      </Flex>
    </Drawer>
  );
}
