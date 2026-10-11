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
import type { ReactionPathComponents } from '#reaction/model/reactionPathComponents.ts';
import { ActionIcon } from '@mantine/core';
import { RemoveIcon } from '#theme/icons/index.ts';
import classes from './reactionEntityDelete.module.scss';
import buttonClasses from '#theme/buttons.module.scss';
import clsx from 'clsx';
import { useDisclosure } from '@mantine/hooks';
import { ConfirmPopover } from '#display/interactions/ConfirmPopover/ConfirmPopover.tsx';
import { useCallback, useRef } from 'react';
import {
  useDrawer,
  useIsViewOnly,
  useReactionActions,
} from '#reaction/provider/reactionProvider.hooks.ts';

interface ReactionEntityDeleteProps {
  entityName: string;
  pathComponents: ReactionPathComponents;
  shouldCloseSidebar?: true;
  onRemove?: () => void;
}

/** A Remove icon that asks for confirmation; it renders nothing on a read-only reaction. */
export function ReactionEntityDelete({
  entityName,
  pathComponents,
  shouldCloseSidebar,
  onRemove,
}: Readonly<ReactionEntityDeleteProps>) {
  const actions = useReactionActions();
  const isViewOnly = useIsViewOnly();
  const drawer = useDrawer();
  const [confirmationOpened, { open: openConfirmation, close: closeConfirmation }] =
    useDisclosure();
  const ref = useRef<HTMLButtonElement>(null);

  const handleRemove = useCallback(() => {
    if (shouldCloseSidebar) {
      drawer.pop();
    }
    if (onRemove) {
      onRemove();
    } else {
      void actions?.remove(pathComponents);
    }
    closeConfirmation();
  }, [
    actions,
    closeConfirmation,
    drawer,
    onRemove,
    pathComponents,
    shouldCloseSidebar,
  ]);

  if (isViewOnly) {
    return null;
  }

  return (
    <ConfirmPopover
      title={`Remove ${entityName}`}
      text={`Are you sure to remove this ${entityName}?`}
      opened={confirmationOpened}
      onConfirm={handleRemove}
      onCancel={closeConfirmation}
      target={
        <ActionIcon
          aria-label={`Remove ${entityName}`}
          onClick={openConfirmation}
          className={clsx(classes.icon, buttonClasses.redHover)}
          variant="transparent"
          color="red"
          ref={ref}
        >
          <RemoveIcon />
        </ActionIcon>
      }
    />
  );
}
