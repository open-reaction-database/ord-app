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
import { useCallback, useContext } from 'react';
import { removeReaction } from 'store/entities/reactions/reactions.thunks.ts';
import { useDisclosure } from '@mantine/hooks';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { Button } from '@mantine/core';
import { RemoveIcon } from 'common/icons';
import { ConfirmPopover } from 'common/components/ConfirmPopover/ConfirmPopover.tsx';
import { removeTemplate } from 'store/entities/templates/templates.thunks.ts';
import type { ReactionId } from 'store/entities/reactions/reactions.types.ts';
import { templatesContext } from 'features/templates/templates.context';

interface RemoveReactionProps {
  reactionId: ReactionId;
}

export function RemoveReaction({ reactionId }: Readonly<RemoveReactionProps>) {
  const { isTemplate } = useContext(templatesContext);
  const dispatch = useAppDispatch();
  const [confirmationOpened, { open: openConfirmation, close: closeConfirmation }] = useDisclosure();
  const entityToRemove = isTemplate ? 'template' : 'reaction';
  const entitieId = isTemplate ? String(reactionId).split('_')[1] : 'reactionId';
  const onReactionRemove = useCallback(() => {
    if (isTemplate) {
      dispatch(removeTemplate(Number(entitieId)));
    } else {
      dispatch(removeReaction(Number(entitieId)));
    }
    closeConfirmation();
  }, [closeConfirmation, dispatch, reactionId]);

  return (
    <ConfirmPopover
      title={`Remove this ${entityToRemove}`}
      text={`Are you sure you want to remove this ${entityToRemove}?`}
      opened={confirmationOpened}
      onConfirm={onReactionRemove}
      onCancel={closeConfirmation}
      target={
        <Button
          variant="transparent"
          onClick={openConfirmation}
          color="red"
          leftSection={<RemoveIcon />}
        >
          Remove
        </Button>
      }
    />
  );
}
