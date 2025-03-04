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
import type { ReactionFormStandaloneField } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { ActionIcon, Flex, Tooltip } from '@mantine/core';
import { InfoCircleIcon } from 'common/icons';

interface ReactionEntityLabelProps {
  wrapperConfig: ReactionFormStandaloneField;
}

export function ReactionEntityLabel({ wrapperConfig }: Readonly<ReactionEntityLabelProps>) {
  const shouldDisplayWrapper = wrapperConfig.label || wrapperConfig.hint;
  // Todo remove action icon from render with React 19
  return shouldDisplayWrapper ? (
    <Flex
      gap="xs"
      align="center"
    >
      <span>{wrapperConfig.label}</span>
      {wrapperConfig.children}
      {wrapperConfig.hint && (
        <Tooltip
          label={wrapperConfig.hint}
          position="bottom-start"
        >
          <ActionIcon
            variant="transparent"
            color="gray"
            size="xs"
          >
            <InfoCircleIcon />
          </ActionIcon>
        </Tooltip>
      )}
    </Flex>
  ) : (
    wrapperConfig.label
  );
}
