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
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type {
  ErrorWarningMessage,
  ErrorWarningMessageWithPath,
  ReactionValidation,
} from 'store/entities/reactions/reactions.types.ts';
import { Badge, Flex, Text, Tooltip } from '@mantine/core';
import classes from './reactionNodeValidationResult.module.scss';
import { useContext, useMemo } from 'react';
import { reactionContext } from '../../reactions.context.ts';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { useSelector } from 'react-redux';

interface ReactionNodeValidationResultProps {
  pathComponents: ReactionPathComponents;
}

interface ReactionNodeValidationResultDisplayProps extends ReactionNodeValidationResultProps {
  validation: ReactionValidation;
}

interface ReactionNodeValidationTooltipContentProps {
  messages: Array<ErrorWarningMessageWithPath>;
}

function ReactionNodeValidationTooltipContent({ messages }: Readonly<ReactionNodeValidationTooltipContentProps>) {
  return (
    <Flex
      direction="column"
      gap="xs"
      className={classes.tooltipContent}
    >
      {messages.map(message => (
        <Flex
          align="center"
          key={`${message.path.toString()}_${message.text}`}
          direction="row"
          wrap="wrap"
          gap="xs"
        >
          {message.path.length > 0 && <Text className={classes.path}>{message.path.join('.')}:</Text>}
          <Text>{message.text}.</Text>
        </Flex>
      ))}
    </Flex>
  );
}

function filterErrorWarningMessagesByPath(
  messages: Array<ErrorWarningMessage>,
  pathComponents: ReactionPathComponents,
): Array<ErrorWarningMessageWithPath> {
  const messagesWithPath = messages.filter(
    item => 'path' in item && item.path.toString().includes(pathComponents.toString()),
  ) as Array<ErrorWarningMessageWithPath>;

  return messagesWithPath.map(item => ({
    ...item,
    path: item.originalPath.split('.').slice(pathComponents.length),
  }));
}

export function ReactionNodeValidationResultDisplay({
  pathComponents,
  validation,
}: Readonly<ReactionNodeValidationResultDisplayProps>) {
  const errorsToDisplay = useMemo(() => {
    return filterErrorWarningMessagesByPath(validation.errors, pathComponents);
  }, [pathComponents, validation.errors]);

  const warningsToDisplay = useMemo(() => {
    return filterErrorWarningMessagesByPath(validation.warnings, pathComponents);
  }, [pathComponents, validation.warnings]);

  const shouldDisplay = warningsToDisplay.length > 0 || errorsToDisplay.length > 0;

  return shouldDisplay ? (
    <>
      {errorsToDisplay.length > 0 && (
        <Tooltip
          multiline
          label={<ReactionNodeValidationTooltipContent messages={errorsToDisplay} />}
          classNames={{ tooltip: classes.errorTooltip }}
        >
          <Badge
            className={classes.badge}
            color="red"
          >
            {errorsToDisplay.length}
          </Badge>
        </Tooltip>
      )}
      {warningsToDisplay.length > 0 && (
        <Tooltip
          multiline
          label={<ReactionNodeValidationTooltipContent messages={warningsToDisplay} />}
          classNames={{ tooltip: classes.warningTooltip }}
        >
          <Badge
            className={classes.badge}
            color="yellow"
          >
            {warningsToDisplay.length}
          </Badge>
        </Tooltip>
      )}
    </>
  ) : null;
}

export function ReactionNodeValidationResult({ pathComponents }: Readonly<ReactionNodeValidationResultProps>) {
  const { reactionId } = useContext(reactionContext);
  const reaction = useSelector(selectReactionById(reactionId));

  if (!('validation' in reaction) || reaction.validation === null) {
    return null;
  }

  return (
    <ReactionNodeValidationResultDisplay
      pathComponents={pathComponents}
      validation={reaction.validation}
    />
  );
}
