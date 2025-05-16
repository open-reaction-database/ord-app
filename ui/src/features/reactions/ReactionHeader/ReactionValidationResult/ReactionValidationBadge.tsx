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
import type { Optional } from 'store/entities/reactions/reactionEntity/reactionEntity.types';
import type { ReactionValidation } from 'store/entities/reactions/reactions.types.ts';
import { CheckCircleIcon, CrossCircleIcon, WarningIcon } from 'common/icons';
import classes from './reactionValidationResult.module.scss';
import { Badge, Flex, Text, Button, type ButtonProps } from '@mantine/core';

const amountText = (count: number, singleLabel: string) => `${count} ${singleLabel}${count === 1 ? '' : 's'}`;

interface ReactionValidationBadgeProps {
  isValid: boolean;
  validation: Optional<ReactionValidation>;
  onClick: () => void;
}

const badgeCommonProps: Pick<ButtonProps, 'variant' | 'size' | 'radius'> & {
  classNames: { root: string };
} = {
  variant: 'outline',
  size: 'lg',
  radius: 'md',
  classNames: {
    root: classes.validationBadge,
  },
};

export function ReactionValidationBadge({ isValid, validation, onClick }: Readonly<ReactionValidationBadgeProps>) {
  const hasDataToDisplay = validation && (validation.errors.length > 0 || validation.warnings.length > 0);

  if (hasDataToDisplay) {
    return (
      <Button
        onClick={onClick}
        {...badgeCommonProps}
      >
        <Flex
          align="center"
          gap="sm"
        >
          <Flex
            align="center"
            gap="xs"
          >
            <CrossCircleIcon className={classes.icon} />
            <Text className={classes.text}>{amountText(validation.errors.length, 'error')}</Text>
          </Flex>
          <Flex
            align="center"
            gap="xs"
          >
            <WarningIcon className={classes.icon} />
            <Text className={classes.text}>{amountText(validation.warnings.length, 'warning')}</Text>
          </Flex>
        </Flex>
      </Button>
    );
  }

  return (
    <Badge
      {...badgeCommonProps}
      leftSection={isValid ? <CheckCircleIcon /> : <CrossCircleIcon />}
    >
      {isValid ? 'Reaction is Valid' : 'Reaction is Not Valid'}
    </Badge>
  );
}
