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
import { Button, Flex, Paper, Title } from '@mantine/core';
import { CopyImageIcon } from '#theme/icons/index.ts';
import { useCallback, useRef, type ReactNode } from 'react';
import { ReactionPreview } from '#reaction/view/ReactionPreview/ReactionPreview.tsx';
import { ReactionValidationResult } from '#reaction/view/ReactionHeader/ReactionValidationResult/ReactionValidationResult.tsx';
import { copyPreviewAsImage } from '#reaction/view/ReactionPreview/reactionPreview.utils.ts';
import classes from '#reaction/view/ReactionCard/reactionCard.module.scss';
import { useReactionSnapshot } from '#reaction/provider/reactionProvider.hooks.ts';

interface ReactionHeaderProps {
  /** Controls beside the validation badge, such as remove and download. */
  actions?: ReactNode;
  /** Controls after the reaction's ID, such as copy and rename. */
  titleActions?: ReactNode;
  /** Shows the reaction's conditions over the preview's arrow. */
  showDetails?: boolean;
}

/** The reaction's validation, ID, and preview, with the host app's controls beside them. */
export function ReactionHeader({
  actions,
  titleActions,
  showDetails = false,
}: Readonly<ReactionHeaderProps>) {
  const pbReactionId = useReactionSnapshot()?.pb_reaction_id;
  const previewRef = useRef<HTMLDivElement | null>(null);

  const onPreviewSave = useCallback(() => {
    // It reports its own success or failure in a notification.
    void copyPreviewAsImage(previewRef.current);
  }, [previewRef]);

  return (
    <>
      <Flex
        justify="space-between"
        align="flex-end"
      >
        <ReactionValidationResult />
        <Flex
          align="center"
          gap="sm"
        >
          {actions}
        </Flex>
      </Flex>
      <Paper
        radius="md"
        p="lg"
      >
        <Flex
          direction="column"
          gap="sm"
        >
          <Flex
            justify="space-between"
            align="center"
          >
            <Flex
              align="center"
              gap="sm"
              className={classes.titleWrapper}
            >
              <Title
                className={classes.title}
                order={2}
              >
                {pbReactionId}
              </Title>
              {titleActions}
            </Flex>
            <Button
              onClick={onPreviewSave}
              variant="transparent"
              leftSection={<CopyImageIcon className={classes.buttonIcon} />}
              className={classes.copyButton}
            >
              Copy reaction image
            </Button>
          </Flex>
          <ReactionPreview
            ref={previewRef}
            showDetails={showDetails}
          />
        </Flex>
      </Paper>
    </>
  );
}
