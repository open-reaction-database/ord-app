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
import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useCallback, type MutableRefObject } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'wouter';
import { CheckListIcon, ChevronDownIcon, CopyImageIcon, DownloadIcon } from 'common/icons';
import classes from './reactionCard.module.scss';
import { DownloadMenu } from 'common/components/DownloadMenu/DownloadMenu.tsx';
import { fileDownloadOptions } from 'common/constants.ts';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { RemoveReaction } from 'features/reactions/RemoveReaction/RemoveReaction.tsx';
import { copyPreviewAsImage } from 'common/components/ReactionPreview/reactionPreview.utils.ts';
import { SaveAsTemplate } from 'features/templates/SaveAsTemplate/SaveAsTemplate.tsx';
import { selectCanDatasetBeEdited } from 'store/features/canDatasetBeEdited/canDatasetBeEdited.selectors.ts';

interface ReactionHeaderActionsProps {
  reactionId: number;
  previewRef: MutableRefObject<HTMLDivElement | null>;
}

export function ReactionHeaderActions({ reactionId, previewRef }: Readonly<ReactionHeaderActionsProps>) {
  const { datasetId: rawDatasetId } = useParams<{ datasetId: string }>();
  const datasetId = parseInt(rawDatasetId);
  const reaction = useSelector(selectReactionById(reactionId));
  const onPreviewSave = useCallback(() => {
    copyPreviewAsImage(previewRef.current);
  }, [previewRef]);
  const [saveAsTemplateOpened, { open: openSaveAsTemplate, close: closeSaveAsTemplate }] = useDisclosure();
  const canDatasetBeEdited = useSelector(selectCanDatasetBeEdited);

  return (
    <>
      {saveAsTemplateOpened && (
        <SaveAsTemplate
          reactionId={reaction.id}
          reactionPbId={reaction.pb_reaction_id}
          onClose={closeSaveAsTemplate}
        />
      )}
      {canDatasetBeEdited && <RemoveReaction reactionId={reaction.id} />}
      <Button
        leftSection={<CheckListIcon className={classes.buttonIcon} />}
        variant="transparent"
        onClick={openSaveAsTemplate}
      >
        Save as a Template
      </Button>

      <Button
        onClick={onPreviewSave}
        variant="transparent"
        leftSection={<CopyImageIcon className={classes.buttonIcon} />}
      >
        Copy reaction image
      </Button>

      <DownloadMenu
        options={fileDownloadOptions}
        url={`/datasets/${datasetId}/reactions/${reaction.id}/download`}
        target={
          <Button
            className={classes.target}
            leftSection={<DownloadIcon />}
            rightSection={<ChevronDownIcon />}
            variant="transparent"
          >
            Download Reaction
          </Button>
        }
      />
    </>
  );
}
