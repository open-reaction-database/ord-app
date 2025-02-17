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
import { CheckListIcon, ChevronDownIcon, DownloadIcon, EditIcon, TrashIcon } from 'common/icons';
import { useCallback, useMemo } from 'react';
import { DownloadMenu } from 'common/components/DownloadMenu/DownloadMenu.tsx';
import { useLocation } from 'wouter';
import { domain, fileDownloadOptions } from 'common/constants.ts';
import classes from 'features/reactions/ReactionHeader/reactionHeader.module.scss';
import { useDisclosure } from '@mantine/hooks';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { InputModal } from 'common/components/InputModal/InputModal.tsx';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import { ReactionPreview } from 'features/reactions/ReactionPreview/ReactionPreview.tsx';

interface ReactionHeaderProps {
  datasetId: number;
  reactionId: number;
}

export function ReactionHeader({ datasetId, reactionId }: Readonly<ReactionHeaderProps>) {
  const [location] = useLocation();
  const dispatch = useAppDispatch();
  const reaction = useSelector(selectReactionById(reactionId));
  const [opened, { open, close }] = useDisclosure();

  const hasReactionDefaultId = reaction.pb_reaction_id === reaction.id.toString();

  const onReactionNameChange = useCallback(
    async (name: string) => {
      dispatch(addUpdateReactionField({ reactionId, pathComponents: ['reactionId'], newValue: name }));
    },
    [dispatch, reactionId],
  );

  const copyOptions = useMemo(
    () => [
      { label: 'Copy Reaction Link', value: `${domain}${location}` },
      { label: 'Copy Reaction ID', value: reactionId.toString() },
    ],
    [reactionId, location],
  );

  return (
    <Paper
      radius="md"
      p="lg"
    >
      <Flex
        direction="column"
        gap="sm"
      >
        <Flex justify="space-between">
          <Flex
            align="center"
            gap="sm"
          >
            {hasReactionDefaultId && (
              <Title
                className={classes.title}
                order={2}
              >
                Reaction
              </Title>
            )}
            <Title order={2}>{reaction.pb_reaction_id}</Title>
            <CopyButton options={copyOptions} />
            <ActionIcon variant="transparent">
              <EditIcon onClick={open} />
            </ActionIcon>
          </Flex>
          <Flex
            align="center"
            gap="sm"
          >
            <Button
              variant="transparent"
              color="red"
              leftSection={<TrashIcon />}
            >
              Remove
            </Button>
            <Button
              variant="transparent"
              leftSection={<CheckListIcon />}
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
            <Button>Save</Button>
          </Flex>
        </Flex>
        <ReactionPreview reaction={reaction} />
      </Flex>
      <InputModal
        opened={opened}
        onClose={close}
        onSubmit={onReactionNameChange}
        title="Change Reaction ID"
        inputLabel="Reaction ID"
        inputPlaceholder="Enter reaction ID"
        initialValue={reaction.pb_reaction_id}
      />
    </Paper>
  );
}
