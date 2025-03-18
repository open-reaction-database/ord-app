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
import { Drawer, Flex, Text } from '@mantine/core';
import type { ReactionValidation } from 'store/entities/reactions/reactions.types.ts';
import { CrossCircleIcon, WarningIcon } from 'common/icons';
import classes from './reactionValidationResult.module.scss';

interface ReactionValidationListProps {
  opened: boolean;
  onClose: () => void;
  validation: ReactionValidation;
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
        {validation.errors.map(error => (
          <Flex
            align="flex-start"
            key={error}
            gap="xs"
          >
            <CrossCircleIcon className={classes.icon} />
            <Text>{error}</Text>
          </Flex>
        ))}
        {validation.warnings.map(warning => (
          <Flex
            align="flex-start"
            key={warning}
            gap="xs"
          >
            <WarningIcon className={classes.icon} />
            <Text>{warning}</Text>
          </Flex>
        ))}
      </Flex>
    </Drawer>
  );
}
