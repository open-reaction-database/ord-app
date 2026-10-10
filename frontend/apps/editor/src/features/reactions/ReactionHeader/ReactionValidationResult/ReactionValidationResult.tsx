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
import { Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';
import { ReactionValidationBadge } from 'features/reactions/ReactionHeader/ReactionValidationResult/ReactionValidationBadge.tsx';
import { ReactionValidationList } from 'features/reactions/ReactionHeader/ReactionValidationResult/ReactionValidationList.tsx';
import { useReactionSnapshot } from 'features/reactions/provider/reactionProvider.hooks.ts';

export function ReactionValidationResult() {
  const [opened, { toggle, close }] = useDisclosure();
  const snapshot = useReactionSnapshot();
  const isValid = snapshot?.is_valid ?? false;
  const validation = snapshot?.validation ?? null;
  const hasErrorsWarnings =
    validation !== null &&
    (validation.errors.length > 0 || validation.warnings.length > 0);

  useEffect(() => {
    if (isValid) {
      close();
    }
  }, [isValid, close]);

  return (
    <Flex>
      <ReactionValidationBadge
        isValid={isValid}
        validation={validation}
        onClick={toggle}
      />
      {hasErrorsWarnings && (
        <ReactionValidationList
          opened={opened}
          validation={validation}
          onClose={close}
        />
      )}
    </Flex>
  );
}
