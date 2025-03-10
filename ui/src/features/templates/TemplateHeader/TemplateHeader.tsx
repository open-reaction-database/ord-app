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
import { useSelector } from 'react-redux';
import { CopyButton } from 'common/components/interactions/CopyButton/CopyButton.tsx';
import { EnumerateIcon, DownloadIcon, EditIcon } from 'common/icons';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { domain } from 'common/constants.ts';
import { typographyClasses } from 'common/styling';
import { useDisclosure } from '@mantine/hooks';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { InputModal } from 'common/components/InputModal/InputModal.tsx';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import { RemoveReaction } from 'features/reactions/RemoveReaction/RemoveReaction.tsx';
import { selectTemplateById } from 'store/entities/templates/templates.selectors.ts';
import { ReactionPreview } from 'features/reactions/ReactionPreview/ReactionPreview.tsx';

interface TemplateHeaderProps {
  templateId: number;
  isReadyForEnumeration: boolean;
}

export function TemplateHeader({ templateId, isReadyForEnumeration }: Readonly<TemplateHeaderProps>) {
  const [location] = useLocation();
  const dispatch = useAppDispatch();
  const template = useSelector(selectTemplateById(templateId));
  const [opened, { open, close }] = useDisclosure();

  const hasReactionDefaultId = template.name === template.id.toString();

  const onReactionNameChange = useCallback(
    async (name: string) => {
      dispatch(addUpdateReactionField({ reactionId: templateId, pathComponents: ['reactionId'], newValue: name }));
    },
    [dispatch, templateId],
  );

  const copyOptions = useMemo(
    () => [
      { label: 'Copy Template Link', value: `${domain}${location}` },
      { label: 'Copy Template ID', value: templateId.toString() },
    ],
    [templateId, location],
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
                className={typographyClasses.secondary1}
                order={2}
              >
                Template
              </Title>
            )}
            <Title order={2}>{template.name}</Title>
            <CopyButton options={copyOptions} />
            <ActionIcon variant="transparent">
              <EditIcon onClick={open} />
            </ActionIcon>
          </Flex>
          <Flex
            align="center"
            gap="sm"
          >
            <RemoveReaction reactionId={templateId} />
            <Button
              variant="transparent"
              leftSection={<EnumerateIcon />}
              disabled={!isReadyForEnumeration}
            >
              Enumerate
            </Button>
            <Button
              leftSection={<DownloadIcon />}
              variant="transparent"
              disabled={!isReadyForEnumeration}
            >
              Download Variables in CSV
            </Button>
            <Button
              leftSection={<DownloadIcon />}
              variant="transparent"
            >
              Download Template in JSON
            </Button>
          </Flex>
        </Flex>
        <ReactionPreview reaction={template} />
      </Flex>
      <InputModal
        opened={opened}
        onClose={close}
        onSubmit={onReactionNameChange}
        title="Edit Template ID"
        inputLabel="Template ID"
        initialValue={template.name}
      />
    </Paper>
  );
}
