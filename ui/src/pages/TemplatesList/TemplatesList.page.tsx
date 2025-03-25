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
import { useMemo } from 'react';
import { Link } from 'wouter';
import { Flex, Paper, Title } from '@mantine/core';
import { PageContainer } from 'common/components/PageContainer/PageContainer.tsx';
import type { Breadcrumbs } from 'common/types/breadcrumbs.ts';
import { useSelector } from 'react-redux';
import classes from './templatesList.page.module.scss';
import { selectTemplatesOrder } from 'store/entities/templates/templates.selectors.ts';
import { Counter } from 'common/components/display/Counter/Counter.tsx';
import { EntitiesMenu } from 'features/templates/EntitiesMenu/EntitiesMenu';
import { ReactionCard } from 'common/components/ReactionCard/ReactionCard.tsx';
import { TemplateHeaderActions } from 'features/templates/TemplateHeaderActions/TemplateHeaderActions.tsx';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';

interface TemplateTitleProps {
  index: number;
  templateId: string;
}

function TemplateTitle({ index, templateId }: Readonly<TemplateTitleProps>) {
  const id = templateId.split('_')[1];
  const linkToPage = `~/templates/${id}`;
  const template = useSelector(selectReactionById(templateId));

  return (
    <>
      <span className={classes.index}>{index}.</span>
      <Link
        className={classes.link}
        to={linkToPage}
      >
        {template.name}
      </Link>
    </>
  );
}

export function TemplatesListPage() {
  const templatesOrder = useSelector(selectTemplatesOrder);

  const breadcrumbs = useMemo((): Breadcrumbs => {
    return [{ title: 'Templates', path: '~/' }];
  }, []);

  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <div className={classes.container}>
        <EntitiesMenu />
        <Flex
          direction="column"
          gap="sm"
          className={classes.templates}
        >
          <Paper
            radius="sm"
            p="lg"
          >
            <Flex justify="space-between">
              <Flex
                align="center"
                gap="sm"
              >
                <Title order={2}>Templates</Title>
                <Counter amount={templatesOrder.length} />
              </Flex>
            </Flex>
          </Paper>
          <>
            {templatesOrder.map((templateId, index) => (
              <ReactionCard
                key={templateId}
                id={templateId}
                actions={<TemplateHeaderActions templateId={templateId} />}
                title={
                  <TemplateTitle
                    index={index + 1}
                    templateId={templateId}
                  />
                }
              />
            ))}
          </>
        </Flex>
      </div>
    </PageContainer>
  );
}
