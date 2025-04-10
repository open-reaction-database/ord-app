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
import { ActionIcon, Button, Flex, Paper, Title } from '@mantine/core';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { useSelector } from 'react-redux';
import { CopyButton } from 'common/components/interactions/CopyButton/CopyButton.tsx';
import { CheckListIcon, ChevronDownIcon, CopyImageIcon, DownloadIcon, EditIcon } from 'common/icons';
import { useCallback, useContext, useMemo, useRef } from 'react';
import { DownloadMenu } from 'common/components/DownloadMenu/DownloadMenu.tsx';
import { useLocation, useRouter } from 'wouter';
import { fileDownloadOptions } from 'common/constants.ts';
import { useDisclosure } from '@mantine/hooks';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { InputModal } from 'common/components/InputModal/InputModal.tsx';
import { renameReaction } from 'store/entities/reactions/reactions.thunks.ts';
import { ReactionPreview } from 'common/components/ReactionPreview/ReactionPreview.tsx';
import { RemoveReaction } from 'features/reactions/RemoveReaction/RemoveReaction.tsx';
import { SaveAsTemplate } from 'features/templates/SaveAsTemplate/SaveAsTemplate.tsx';
import { ReactionValidationResult } from 'features/reactions/ReactionHeader/ReactionValidationResult/ReactionValidationResult.tsx';
import { copyPreviewAsImage } from 'common/components/ReactionPreview/reactionPreview.utils.ts';
import classes from 'common/components/ReactionCard/reactionCard.module.scss';
import { reactionContext } from '../reactions.context.ts';
import { domain } from 'common/configuration.constants.ts';
import { selectIsReactionRenameOpened } from 'store/features/reactionRename/reactionRename.selector.ts';
import { setReactionRenameOpenedAction } from 'store/features/reactionRename/reactionRename.actions.ts';

interface ReactionHeaderProps {
  datasetId: number;
  reactionId: number;
}

export function ReactionHeader({ datasetId, reactionId }: Readonly<ReactionHeaderProps>) {
  const [location] = useLocation();
  const { base } = useRouter();
  const dispatch = useAppDispatch();
  const { isViewOnly } = useContext(reactionContext);
  const reaction = useSelector(selectReactionById(reactionId));
  const isRenameOpened = useSelector(selectIsReactionRenameOpened);

  const onRenameOpen = useCallback(() => {
    dispatch(setReactionRenameOpenedAction(true));
  }, [dispatch]);

  const onRenameClose = useCallback(() => {
    dispatch(setReactionRenameOpenedAction(false));
  }, [dispatch]);

  const [saveAsTemplateOpened, { open: openSaveAsTemplate, close: closeSaveAsTemplate }] = useDisclosure();
  const previewRef = useRef<HTMLDivElement | null>(null);

  const onReactionNameChange = useCallback(
    async (name: string) => {
      dispatch(renameReaction({ reactionId, name }));
    },
    [dispatch, reactionId],
  );

  const onPreviewSave = useCallback(() => {
    copyPreviewAsImage(previewRef.current);
  }, [previewRef]);

  const copyOptions = useMemo(
    () => [
      { label: 'Copy Reaction Link', value: `${domain}${base}${location}` },
      { label: 'Copy Reaction ID', value: reaction.pb_reaction_id ?? '' },
    ],
    [base, location, reaction.pb_reaction_id],
  );

  return (
    <>
      <Flex
        justify="space-between"
        align="flex-end"
      >
        <ReactionValidationResult reactionId={reactionId} />
        <Flex
          align="center"
          gap="sm"
        >
          {!isViewOnly && <RemoveReaction reactionId={reactionId} />}
          <Button
            variant="transparent"
            leftSection={<CheckListIcon />}
            onClick={openSaveAsTemplate}
          >
            Save as Template
          </Button>
          <DownloadMenu
            options={fileDownloadOptions}
            url={`/datasets/${datasetId}/reactions/${reactionId}/download`}
            target={
              <Button
                leftSection={<DownloadIcon />}
                rightSection={<ChevronDownIcon />}
                variant="transparent"
              >
                Download Reaction
              </Button>
            }
          />
        </Flex>
      </Flex>
      <Paper
        radius="md"
        p="lg"
      >
        {saveAsTemplateOpened && (
          <SaveAsTemplate
            reactionId={reactionId}
            reactionPbId={reaction.pb_reaction_id}
            onClose={closeSaveAsTemplate}
          />
        )}
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
                {reaction.pb_reaction_id}
              </Title>
              <CopyButton options={copyOptions} />
              {!isViewOnly && (
                <ActionIcon variant="transparent">
                  <EditIcon onClick={onRenameOpen} />
                </ActionIcon>
              )}
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
            reaction={reaction}
            ref={previewRef}
          />
        </Flex>
      </Paper>
      {isRenameOpened && (
        <InputModal
          onClose={onRenameClose}
          onSubmit={onReactionNameChange}
          title="Edit Reaction ID"
          inputLabel="Reaction ID"
          initialValue={reaction.data.reactionId ?? ''}
          stayOpenedOnSubmit
        />
      )}
    </>
  );
}
