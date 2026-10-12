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
import { templateIdFromNumber } from 'store/entities/templates/templateIds.ts';
import { useParams } from 'wouter';
import { useMemo } from 'react';
import { Badge, Flex, Paper } from '@mantine/core';
import { useSelector } from 'react-redux';
import classes from './templatePage.module.scss';
import {
  ReactionDetailsSidebar,
  ReactionTabs,
} from '@open-reaction-database/ui/reaction';
import { EditorPageContainer } from 'common/components/PageContainer/EditorPageContainer.tsx';
import type { Breadcrumbs } from '@open-reaction-database/ui/shell';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { selectAreTemplatesLoaded } from 'store/entities/templates/templates.selectors.ts';
import { NotFoundPage } from 'pages/NotFound/NotFoundPage.tsx';
import { TemplateHeader } from 'features/templates/TemplateHeader/TemplateHeader.tsx';
import { VariablesSidebar } from '../../features/templates/VariablesSidebar/VariablesSidebar.tsx';
import { TemplateReactionProvider } from 'features/templates/TemplateReactionProvider/TemplateReactionProvider.tsx';

export function TemplatePage() {
  const { templateId: rawTemplateId } = useParams<{ templateId: string }>();
  const templateId = templateIdFromNumber(rawTemplateId);
  const template = useSelector(selectReactionById(templateId));
  const areTemplatesLoaded = useSelector(selectAreTemplatesLoaded);

  const breadcrumbs = useMemo((): Breadcrumbs => {
    return [
      { title: 'Templates', path: '~/templates' },
      {
        path: `~/templates/${rawTemplateId}`,
        title: template?.name ?? `Template ${rawTemplateId}`,
      },
    ];
  }, [rawTemplateId, template?.name]);

  // Once the template list has loaded, an unknown id is genuinely missing — show a 404 instead of
  // a blank page. While templates are still loading we keep rendering so we don't flash a 404. (#496)
  if (areTemplatesLoaded && !template) {
    return (
      <NotFoundPage
        rejectValue={{ errorCode: 404, errorMessage: 'Template not found' }}
      />
    );
  }

  return (
    <EditorPageContainer
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
      <TemplateReactionProvider templateId={templateId}>
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
              <ReactionTabs />
            </Paper>
            <ReactionDetailsSidebar />
            <VariablesSidebar templateId={templateId} />
          </Flex>
        )}
      </TemplateReactionProvider>
    </EditorPageContainer>
  );
}
