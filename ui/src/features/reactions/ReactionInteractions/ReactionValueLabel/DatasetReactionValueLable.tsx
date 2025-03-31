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
import { Flex, Tooltip } from '@mantine/core';
import { InfoCircleIcon } from 'common/icons';
import type { ReactionValueLabelProps } from './reactionValueLabel.types.ts';
import classes from './reactionValueLabel.module.scss';
import clsx from 'clsx';

export function DatasetReactionValueLabel({ wrapperConfig }: Readonly<ReactionValueLabelProps>) {
  if (!wrapperConfig?.label) {
    return null;
  }
  const shouldDisplayWrapper = wrapperConfig.label || wrapperConfig.hint;
  return shouldDisplayWrapper ? (
    <Flex
      gap="xs"
      align="center"
      className={classes.badgeWrapper}
    >
      <span>{wrapperConfig.label}</span>
      {wrapperConfig.children}
      {wrapperConfig.hint && (
        <Tooltip
          label={wrapperConfig.hint}
          position="bottom-start"
        >
          <InfoCircleIcon className={clsx(classes.icon, classes.info)} />
        </Tooltip>
      )}
    </Flex>
  ) : (
    wrapperConfig.label
  );
}
