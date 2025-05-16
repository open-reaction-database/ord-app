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
import { useContext, useMemo } from 'react';
import { reactionContext } from '../../reactions.context.ts';
import { useSelector } from 'react-redux';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import type { ErrorWarningMessage, ReactionValidation } from 'store/entities/reactions/reactions.types.ts';
import { Flex, Text, Tooltip } from '@mantine/core';
import { CrossCircleIcon, WarningIcon } from 'common/icons';
import classes from './reactionNodeValidationResult.module.scss';

interface ReactionNodeValidationResultProps {
  pathComponents: ReactionPathComponents;
}

interface ReactionNodeValidationResultDisplayProps extends ReactionNodeValidationResultProps {
  validation: ReactionValidation;
}

interface ReactionNodeValidationTooltipContentProps {
  messages: Array<ErrorWarningMessage>;
}

function ReactionNodeValidationTooltipContent({ messages }: Readonly<ReactionNodeValidationTooltipContentProps>) {
  return (
    <Flex
      direction="column"
      gap="xs"
    >
      {messages.map(message => (
        <Text key={message.text}>{message.text}</Text>
      ))}
    </Flex>
  );
}

function filterErrorWarningMessagesByPath(
  messages: Array<ErrorWarningMessage>,
  pathComponents: ReactionPathComponents,
): Array<ErrorWarningMessage> {
  return messages.filter(item => 'path' in item && item.path.toString() === pathComponents.toString());
}

export function ReactionNodeValidationResultDisplay({
  pathComponents,
  validation,
}: Readonly<ReactionNodeValidationResultDisplayProps>) {
  const errorsToDisplay = useMemo(() => {
    return filterErrorWarningMessagesByPath(validation.errors, pathComponents);
  }, [pathComponents, validation.errors]);

  const warningsToDisplay = useMemo(() => {
    return validation.warnings
      .filter(item => 'path' in item && item.path.toString() === pathComponents.toString())
      .map(item => item.text)
      .join('<br/>');
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
          <CrossCircleIcon className={classes.icon} />
        </Tooltip>
      )}
      {warningsToDisplay.length > 0 && (
        <Tooltip
          multiline
          label={warningsToDisplay}
          classNames={{ tooltip: classes.warningTooltip }}
        >
          <WarningIcon className={classes.icon} />
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
