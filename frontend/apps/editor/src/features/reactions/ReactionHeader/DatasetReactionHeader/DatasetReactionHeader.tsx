/*
 * Copyright 2026 Open Reaction Database Project Authors
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
import { ActionIcon, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useRouter } from 'wouter';
import { CopyButton } from 'common/components/interactions/CopyButton/CopyButton.tsx';
import { CheckListIcon, ChevronDownIcon, DownloadIcon, EditIcon } from 'common/icons';
import { DownloadMenu } from 'common/components/DownloadMenu/DownloadMenu.tsx';
import { InputModal } from 'common/components/InputModal/InputModal.tsx';
import { fileDownloadOptions } from 'common/constants.ts';
import { domain } from 'common/configuration.constants.ts';
import {
  useIsViewOnly,
  useReactionSnapshot,
} from 'features/reactions/provider/reactionProvider.hooks.ts';
import { RemoveReaction } from 'features/reactions/RemoveReaction/RemoveReaction.tsx';
import { SaveAsTemplate } from 'features/templates/SaveAsTemplate/SaveAsTemplate.tsx';
import { renameReaction } from 'store/entities/reactions/reactions.thunks.ts';
import { setReactionRenameOpenedAction } from 'store/features/reactionRename/reactionRename.actions.ts';
import { selectIsReactionRenameOpened } from 'store/features/reactionRename/reactionRename.selector.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { downloadFileFromUrl } from 'store/utils/downloadFile.thunks.ts';
import { ReactionHeader } from '../ReactionHeader.tsx';

interface DatasetReactionHeaderProps {
  datasetId: number;
  reactionId: number;
}

/** The reaction page's header, with the editor's actions on a dataset reaction. */
export function DatasetReactionHeader({
  datasetId,
  reactionId,
}: Readonly<DatasetReactionHeaderProps>) {
  const [location] = useLocation();
  const { base } = useRouter();
  const dispatch = useAppDispatch();
  const isViewOnly = useIsViewOnly();
  const pbReactionId = useReactionSnapshot()?.pb_reaction_id ?? '';
  const isRenameOpened = useSelector(selectIsReactionRenameOpened);

  const onRenameOpen = useCallback(() => {
    dispatch(setReactionRenameOpenedAction(true));
  }, [dispatch]);

  const onRenameClose = useCallback(() => {
    dispatch(setReactionRenameOpenedAction(false));
  }, [dispatch]);

  const [
    saveAsTemplateOpened,
    { open: openSaveAsTemplate, close: closeSaveAsTemplate },
  ] = useDisclosure();

  const onReactionNameChange = useCallback(
    async (name: string) => {
      dispatch(renameReaction({ reactionId, name }));
    },
    [dispatch, reactionId],
  );

  const copyOptions = useMemo(
    () => [
      { label: 'Copy Reaction Link', value: `${domain}${base}${location}` },
      { label: 'Copy Reaction ID', value: pbReactionId },
    ],
    [base, location, pbReactionId],
  );

  return (
    <>
      <ReactionHeader
        actions={
          <>
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
              download={format =>
                downloadFileFromUrl(
                  `/datasets/${datasetId}/reactions/${reactionId}/download?file_format=${format}`,
                )
              }
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
          </>
        }
        titleActions={
          <>
            <CopyButton options={copyOptions} />
            {!isViewOnly && (
              <ActionIcon variant="transparent">
                <EditIcon onClick={onRenameOpen} />
              </ActionIcon>
            )}
          </>
        }
      />
      {saveAsTemplateOpened && (
        <SaveAsTemplate
          reactionId={reactionId}
          reactionPbId={pbReactionId}
          onClose={closeSaveAsTemplate}
        />
      )}
      {isRenameOpened && (
        <InputModal
          onClose={onRenameClose}
          onSubmit={onReactionNameChange}
          title="Edit Reaction ID"
          inputLabel="Reaction ID"
          initialValue={pbReactionId}
          stayOpenedOnSubmit
        />
      )}
    </>
  );
}
