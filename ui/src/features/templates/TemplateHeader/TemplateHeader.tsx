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
import { ActionIcon, Flex, Paper, Title } from '@mantine/core';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { useSelector } from 'react-redux';
import { EditIcon } from 'common/icons';
import { useCallback } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { InputModal } from 'common/components/InputModal/InputModal.tsx';
import { ReactionPreview } from 'common/components/ReactionPreview/ReactionPreview.tsx';
import { TemplateHeaderActions } from 'features/templates/TemplateHeaderActions/TemplateHeaderActions';
import { renameTemplate } from 'store/entities/templates/templates.thunks.ts';
import { ValidityButton } from 'common/components/interactions/ValidityButton/ValidityButton.tsx';
import { setVariablesSidebarOpenedAction } from 'store/features/variablesSidebar/variablesSidebar.actions.ts';

interface TemplateHeaderProps {
  templateId: string;
}

export function TemplateHeader({ templateId }: Readonly<TemplateHeaderProps>) {
  const dispatch = useAppDispatch();
  const template = useSelector(selectReactionById(templateId));
  const variablesSize = Object.keys(template?.variables ?? {}).length;
  const isReadyForEnumeration = variablesSize > 0;
  const [opened, { open, close }] = useDisclosure();
  const onTemplateNameChange = useCallback(
    async (_name: string) => {
      dispatch(renameTemplate({ templateId: templateId, name: _name }));
    },
    [dispatch, templateId],
  );

  const onVariablesSidebarOpen = useCallback(() => {
    if (isReadyForEnumeration) {
      dispatch(setVariablesSidebarOpenedAction(true));
    }
  }, [isReadyForEnumeration, dispatch]);

  return (
    <Flex
      direction="column"
      gap="sm"
    >
      <Flex
        align="center"
        justify="space-between"
      >
        <ValidityButton
          validText="Template is valid"
          invalidText="Not Ready for Enumeration: No Variables"
          isValid={isReadyForEnumeration}
          onClick={onVariablesSidebarOpen}
          isNotClickable={!isReadyForEnumeration}
        />
        <Flex align="center">
          <TemplateHeaderActions templateId={templateId} />
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
          <Flex justify="space-between">
            <Flex
              align="center"
              gap="sm"
            >
              <Title order={2}>{template.name}</Title>
              <ActionIcon variant="transparent">
                <EditIcon onClick={open} />
              </ActionIcon>
            </Flex>
          </Flex>
          <ReactionPreview reaction={template} />
        </Flex>
        {opened && (
          <InputModal
            onClose={close}
            onSubmit={onTemplateNameChange}
            title="Edit Template ID"
            inputLabel="Template ID"
            initialValue={template.name}
          />
        )}
      </Paper>
    </Flex>
  );
}
