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
import { useParams } from 'wouter';
import { useMemo } from 'react';
import { Badge, Flex, Paper } from '@mantine/core';
import { useSelector } from 'react-redux';
import classes from './templatePage.module.scss';
import { ReactionDetailsSidebar } from 'features/reactions/ReactionDetailsSidebar/ReactionDetailsSidebar.tsx';
import { PageContainer } from 'common/components/PageContainer/PageContainer.tsx';
import type { Breadcrumbs } from 'common/types/breadcrumbs.ts';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { ReactionTabs } from 'features/reactions/ReactionEntities/ReactionTabs/ReactionTabs.tsx';
import { TemplateHeader } from 'features/templates/TemplateHeader/TemplateHeader.tsx';
import { reactionContext } from 'features/reactions/reactions.context.ts';
import type { ReactionsContext } from 'features/reactions/reactions.types.ts';
import { TemplateReactionValueLabelWrapper } from 'features/reactions/ReactionInteractions/ReactionValueLabel/TemplateReactionValueLabel.tsx';
import { ReactionSetVariablesButton } from 'features/reactions/ReactionInteractions/ReactionViewDeleteButtons/ReactionSetVariablesButton.tsx';

export function TemplatePage() {
  const { templateId: rawTemplateId } = useParams<{ templateId: string }>();
  const templateId = `template_${rawTemplateId}`;
  const template = useSelector(selectReactionById(templateId));

  const breadcrumbs = useMemo((): Breadcrumbs => {
    return [
      { title: 'Templates', path: '~/templates' },
      {
        path: `~/templates/${templateId}`,
        title: template?.name ?? templateId.toString(),
      },
    ];
  }, [templateId, template?.name]);

  const reactionContextValue = useMemo(
    (): ReactionsContext => ({
      reactionId: templateId,
      isTemplate: true,
      isViewOnly: true,
      ViewDeleteButtonsComponent: ReactionSetVariablesButton,
      ValueLabelComponent: TemplateReactionValueLabelWrapper,
    }),
    [templateId],
  );

  return (
    <PageContainer
      breadcrumbs={breadcrumbs}
      badge={
        <Badge
          autoContrast
          className={classes.templateBadge}
        >
          Template
        </Badge>
      }
    >
      <reactionContext.Provider value={reactionContextValue}>
        {template && (
          <Flex
            direction="column"
            gap="sm"
            miw={50}
          >
            <TemplateHeader templateId={templateId} />
            <Paper
              radius="md"
              p="lg"
            >
              <ReactionTabs reactionId={templateId} />
            </Paper>
            <ReactionDetailsSidebar reactionId={templateId} />
          </Flex>
        )}
      </reactionContext.Provider>
    </PageContainer>
  );
}
